import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  metadata: 1.00,
} as const;

export const CatalystRegistration = {
  score:
    (
      { metadata }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const metadataWeight =
          yield* _calcMetadataWeight(metadata);

        const description = "Catalyst Registration";
        const type = "catalyst_registration";

        const weights = [metadataWeight];

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) => {
    let score: CalculatedScore<undefined>;

    if (!metadata.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.metadata * metadata.filter(
      ({ label }) =>
        label === "61284" || label === "61285"
    ).length / metadata.length;

    score = [weight, undefined];
    return Effect.succeed(score);
  };
