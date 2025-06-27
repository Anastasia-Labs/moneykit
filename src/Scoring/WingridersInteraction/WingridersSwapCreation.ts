import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";
import { Lucid } from "../../Service/Lucid";

const WEIGHTING = {
  userAccounts: .75,
  metadata: .25,
} as const;

export const WingridersSwapCreation = {
  score:
    (
      intermediaryTx: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const weights =
          yield* Effect.all([
            _calcUserAccountsWeight(intermediaryTx.accounts.user),
            _calcMetadataWeight(intermediaryTx.metadata),
          ]);

        const description = "Created a swap order on Wingriders";
        const type = intermediaryTx.type === `${undefined}`
          ? "amm_dex"
          : intermediaryTx.type;

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcUserAccountsWeight =
  (user: readonly Account[]) =>
    Effect.gen(function* () {
      let score: CalculatedScore<undefined>;

      const scriptTotal: Record<string, number> = {};
      const nonScriptTotal: Record<string, number> = {};

      for (const account of user) {
        const skip =
          yield* Effect.gen(function* () {
            const { paymentCredential, stakeCredential } =
              yield* Lucid.getAddressDetails(account.address);
            if (
              paymentCredential?.type === "Script" ||
              stakeCredential?.type === "Script"
            ) for (const { currency, amount } of account.total) {
              const maybeLP = currency.includes("-LPT-");
              if (maybeLP || amount < 0) continue; // skip LP Tokens or negative amounts
              scriptTotal[currency] = (scriptTotal[currency] ?? 0) + amount;
            } else for (const { currency, amount } of account.total) {
              const maybeLP = currency.includes("-LPT-");
              if (maybeLP || amount > 0) continue; // skip LP Tokens or positive amounts
              nonScriptTotal[currency] = (nonScriptTotal[currency] ?? 0) + amount;
            }
          }).pipe(
            Effect.catchAllCause(
              () =>
                Effect.succeed(true)
            )
          );
        if (skip) continue;
      }

      const weight =
        Object.keys(scriptTotal).length && Object.keys(nonScriptTotal).length
          ? WEIGHTING.userAccounts
          : 0;

      score = [weight, undefined];
      return score;
    });

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) =>
    Effect.gen(function* () {
      let score: CalculatedScore<undefined>;

      const metadataWeight =
        yield* Util.weighMetadataMsg(
          "674",
          "WingRiders Swap".split(" "),
          metadata,
        );
      const weight = metadataWeight * WEIGHTING.metadata;

      score = [weight, undefined];
      return score;
    });
