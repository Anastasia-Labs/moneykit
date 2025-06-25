import { Effect } from "effect";

import type { AssetInfo, BfAPI } from "./Blockfrost";
import { Blockfrost } from "./Blockfrost";
import type { Cache } from "./Cache";
import type { LucidError } from "./Lucid";
import { Lucid } from "./Lucid";

import type { Account, Asset } from "../Domain/Manifest";
import type { AddressAmounts, Amounts, CalculatedScore, ScDescLookup } from "../Domain/Types";

export const Util = {
  isKeyAddress:
    (address: string): Effect.Effect<boolean, LucidError, Cache> =>
      Effect.gen(function* () {
        const { paymentCredential } = yield* Lucid.getAddressDetails(address);
        return paymentCredential?.type === "Key";
      }),

  isLovelaceOrADA:
    (currency: string): Effect.Effect<boolean> => {
      const c = currency.toLowerCase();
      return Effect.succeed(c === "lovelace" || c === "ada");
    },

  convertAmountToNumber:
    (amount: bigint, decimals: number): Effect.Effect<number> => {
      const t = BigInt(10 ** decimals);
      const a = amount / t;
      const b = (amount < 0n ? -amount : amount) % t;
      return Effect.succeed(
        parseFloat(
          `${a ? a
            : (amount < 0n ? "-0" : "0")
          }.${`${b}`
            .padStart(decimals, "0")
          }`)
      );
    },

  getTotalAmounts:
    (amounts: Amounts): Effect.Effect<Array<Asset>, never, Cache | BfAPI> =>
      Effect.all(
        Object.keys(amounts)
          .filter(
            (currency) =>
              amounts[currency] !== 0n
          )
          .map(
            (currency) =>
              Effect.gen(function* () {
                const isLovelaceOrADA =
                  yield* Util.isLovelaceOrADA(currency);
                const fromUnit =
                  isLovelaceOrADA
                    ? ({ metadata: { name: currency, decimals: 6 } } as AssetInfo)
                    : yield* Effect.match(
                      Blockfrost.getAssetInfo(currency),
                      {
                        onSuccess:
                          (info) =>
                            info,
                        onFailure:
                          () =>
                            ({ metadata: { name: currency, decimals: 0 } } as AssetInfo),
                      },
                    );

                const decimals = fromUnit.metadata?.decimals ?? 0;

                return {
                  currency: `${fromUnit.metadata?.name
                    ?? fromUnit.onchain_metadata?.name
                    ?? fromUnit.fingerprint
                    ?? currency}`,
                  amount: yield* Util.convertAmountToNumber(amounts[currency], decimals),
                };
              })
          )
      ),

  convertAddressAmountsToAccounts:
    (
      addressAmounts: AddressAmounts,
      addressRole: string | undefined,
      lookup: ScDescLookup,
    ): Effect.Effect<Array<Account>, LucidError, Cache | BfAPI> =>
      Effect.all(
        Object.keys(addressAmounts).map(
          (address) =>
            Effect.gen(function* () {
              return {
                address,
                role: addressRole
                  ?? lookup[address]?.role
                  ?? `Unknown ${(yield* Util.isKeyAddress(address))
                    ? "Address" : "Script"}`,
                total: yield* Util.getTotalAmounts(addressAmounts[address]),
              };
            })
        )
      ),

  joinWords:
    (words: Array<string>): Effect.Effect<string> =>
      Effect.gen(function* () {
        if (words.length < 2) return words.join("");
        if (words.length === 2) return words.join(" and ");

        const last = words.length - 1;
        return yield* Util.joinWords([
          words.slice(0, last).join(", "),
          words[last],
        ]);
      }),

  formatAmount:
    (amount: number, currency: string): Effect.Effect<string> =>
      Effect.succeed(`${Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }).format(amount)} ${currency}${Math.abs(amount) > 1 &&
        currency.toLowerCase().endsWith("token")
        ? "s" : ""}`),

  weighMetadataMsg:
    (
      label: string,
      keywords: readonly string[],
      metadata: readonly Record<string, any>[],
    ): Effect.Effect<number> => {
      if (!metadata.length) return Effect.succeed(0);

      const keywordsCount = keywords.length;
      const KEYWORDS = keywords.map(
        (keyword) =>
          keyword.toUpperCase(),
      );

      return Effect.succeed(
        metadata.filter(
          (data) =>
            data.label === label && data.json_metadata?.msg?.find(
              (message: string) => {
                let hit = 0;
                let startPos = 0;

                for (const KEYWORD of KEYWORDS) {
                  const k = message.toUpperCase().indexOf(KEYWORD, startPos);

                  if (k < 0) break;
                  startPos = k + 1;
                  hit += 1;
                }

                return hit === keywordsCount;
              }
            )
        ).length / metadata.length
      );
    },

  sumWeights:
    (weights: Array<CalculatedScore<any>>): Effect.Effect<number> =>
      Effect.succeed(
        parseFloat(
          weights.reduce(
            (sum, [weight]) => sum + weight,
            0,
          ).toFixed(2)
        )
      ),
};
