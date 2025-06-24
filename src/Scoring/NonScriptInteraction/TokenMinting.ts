import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, Blockfrost, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  tokenMinting: 1.00,
} as const;

export const TokenMinting = {
  score:
    (
      { accounts }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const tokenMintingWeight =
          yield* _calcTokenMintingWeight(accounts.user, txUTXOs);

        const [, totalTokens] = tokenMintingWeight;

        const mintedTokens =
          yield* Effect.all(
            Object.keys(totalTokens).map(
              (currency) =>
                Effect.gen(function* () {
                  const qty = totalTokens[currency];
                  const absQty = Math.abs(qty);

                  return `${qty < 0
                    ? "burned"
                    : "minted"} ${yield* Util
                      .formatAmount(
                        absQty,
                        currency,
                      )}`;
                })
            )
          );

        const description = `Token ${mintedTokens.length
          ? yield* Util.joinWords(mintedTokens)
          : "Minting/Burning"}`;
        const type = "token_minting";

        const score = yield* Util.sumWeights([tokenMintingWeight]);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcTokenMintingWeight =
  (user: readonly Account[], txUTXOs: TransactionUTXOs) =>
    Effect.gen(function* () {
      let score: CalculatedScore<Record<string, number>>;

      const inputAssets = txUTXOs.inputs.reduce(
        (sum: Record<string, bigint>, input) => {
          input.amount.reduce(
            (sum: Record<string, bigint>, asset) => {
              if (asset.unit !== "lovelace")
                sum[asset.unit] = (sum[asset.unit] ?? 0n) - BigInt(asset.quantity);
              return sum;
            },
            sum,
          );
          return sum;
        },
        {},
      );

      const totalAssets = txUTXOs.inputs.reduce(
        (sum: Record<string, bigint>, input) => {
          input.amount.reduce(
            (sum: Record<string, bigint>, asset) => {
              if (asset.unit !== "lovelace")
                sum[asset.unit] = (sum[asset.unit] ?? 0n) + BigInt(asset.quantity);
              return sum;
            },
            sum,
          );
          return sum;
        },
        inputAssets,
      );

      const totalMintedAssets: Record<string, number> = {};
      for (const unit of Object.keys(totalAssets)) {
        const amount = totalAssets[unit];
        if (amount === 0n) continue; // skip no movement
        const { metadata, onchain_metadata, fingerprint } =
          yield* Blockfrost.getAssetInfo(unit);
        const currency =
          `${metadata?.name || onchain_metadata?.name || fingerprint || unit}`;
        const decimals =
          metadata?.decimals ?? 0;
        totalMintedAssets[currency] =
          yield* Util.convertAmountToNumber(amount, decimals);
      }

      const userMintedAssets = user.reduce(
        (sum: Record<string, number>, { total }) => {
          total.reduce(
            (sum: Record<string, number>, { currency, amount }) => {
              if (currency !== "ADA" && totalMintedAssets[currency])
                sum[currency] = (sum[currency] ?? 0) + amount;
              return sum;
            },
            sum,
          );
          return sum;
        },
        {},
      );

      const weight = Object.keys(userMintedAssets).length ? WEIGHTING.tokenMinting : 0;

      score = [weight, userMintedAssets];
      return score;
    });
