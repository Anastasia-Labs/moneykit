import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Asset, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  otherAccounts: .80,
  withdrawal: .10,
  metadata: .10,
} as const;

export const WingridersHarvestTx = {
  score:
    (
      intermediaryTx: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const [
          otherAccountsWeight,
          withdrawalWeight,
          metadataWeight,
        ] =
          yield* Effect.all([
            _calcOtherAccountsWeight(intermediaryTx.accounts.other),
            _calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
            _calcMetadataWeight(intermediaryTx.metadata),
          ]);

        const [, harvestedTokens] = otherAccountsWeight;

        const description = harvestedTokens?.length
          ? `Harvested ${yield* Util.joinWords(harvestedTokens)} from Wingriders`
          : intermediaryTx.description;
        const type = intermediaryTx.type === `${undefined}`
          ? "yield_farming"
          : intermediaryTx.type;

        const weights = [
          otherAccountsWeight,
          withdrawalWeight,
          metadataWeight,
        ];

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcOtherAccountsWeight =
  (other: readonly Account[]) =>
    Effect.gen(function* () {
      let score: CalculatedScore<readonly string[] | undefined>;

      const assets = other.reduce(
        (sum: Record<string, number>, { role, total }) => {
          if (role.startsWith("Wingriders Farm"))
            total.reduce(
              (sum: Record<string, number>, { currency, amount }) => {
                sum[currency] = (sum[currency] ?? 0) - amount;
                return sum;
              },
              sum,
            );
          return sum;
        },
        {},
      );

      const currencies = Object.keys(assets);
      if (!currencies.length) {
        score = [0, undefined];
        return score;
      }

      const harvestedTokens =
        yield* Effect.all(
          currencies
            .filter(
              (currency) =>
                assets[currency] > 0 && !currency.includes("-LPT-")
            )
            .map(
              (currency) =>
                Util.formatAmount(assets[currency], currency)
            )
        );

      const weight =
        WEIGHTING.otherAccounts * harvestedTokens.length / currencies.length;

      score = [weight, harvestedTokens];
      return score;
    });

const _calcWithdrawalWeight =
  (withdrawal?: Asset) => {
    let score: CalculatedScore<undefined>;

    const weight = withdrawal ? 0 : WEIGHTING.withdrawal;

    score = [weight, undefined];
    return Effect.succeed(score);
  };

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) => {
    let score: CalculatedScore<undefined>;

    const weight = metadata.length ? 0 : WEIGHTING.metadata;

    score = [weight, undefined];
    return Effect.succeed(score);
  };
