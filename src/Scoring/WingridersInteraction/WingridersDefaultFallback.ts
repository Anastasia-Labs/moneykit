import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  otherAccounts: .65,
  metadata: .35,
} as const;

export const WingridersDefaultFallback = {
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
            _calcOtherAccountsWeight(intermediaryTx.accounts.other),
            _calcMetadataWeight(intermediaryTx.metadata),
          ]);

        const description = "Executed an order on Wingriders";
        const type = intermediaryTx.type === `${undefined}`
          ? "amm_dex"
          : intermediaryTx.type;

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcOtherAccountsWeight =
  (other: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

    if (!other.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const hasWingriders =
      other.find(
        ({ role }) =>
          role.toUpperCase().includes("WINGRIDERS")
      );
    if (hasWingriders) {
      score = [WEIGHTING.otherAccounts, undefined];
      return Effect.succeed(score);
    }

    const hasScript =
      other.find(
        ({ role }) =>
          role === "Unknown Script"
      );
    if (hasScript) {
      score = [WEIGHTING.otherAccounts / 2, undefined];
      return Effect.succeed(score);
    }

    score = [0, undefined];
    return Effect.succeed(score);
  };

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) =>
    Effect.gen(function* () {
      let score: CalculatedScore<undefined>;

      const metadataWeight =
        yield* Util.weighMetadataMsg(
          "674",
          ["Wingriders"],
          metadata,
        );

      const weight = metadataWeight * WEIGHTING.metadata;

      score = [weight, undefined];
      return score;
    });
