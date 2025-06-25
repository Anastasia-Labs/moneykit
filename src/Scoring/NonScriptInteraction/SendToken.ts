import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  userAccounts: .75,
  otherAccounts: .20,
  metadata: .05,
} as const;

export const SendToken = {
  score:
    (
      { accounts, metadata }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const [
          userAccountsWeight,
          otherAccountsWeight,
          metadataWeight,
        ] =
          yield* Effect.all([
            _calcUserAccountsWeight(accounts.user),
            _calcOtherAccountsWeight(accounts.other),
            _calcMetadataWeight(metadata),
          ]);

        const totalTokens: Record<string, number> = {};

        const [, inputTokens] = userAccountsWeight;

        Object.keys(inputTokens).forEach(
          (currency) => {
            if (currency !== "ADA")
              totalTokens[currency] = (totalTokens[currency] ?? 0) - inputTokens[currency];
          }
        );

        const sendTokens =
          yield* Effect.all(
            Object.keys(totalTokens)
              .filter(
                (currency) =>
                  totalTokens[currency] > 0
              )
              .map(
                (currency) =>
                  Effect.gen(function* () {
                    return yield* Util.formatAmount(totalTokens[currency], currency);
                  })
              )
          );

        const description = `Sent ${yield* Util.joinWords(sendTokens)}`.trim();
        const type = "send_tokens";

        const weights = [
          userAccountsWeight,
          otherAccountsWeight,
          metadataWeight,
        ];

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcUserAccountsWeight =
  (user: readonly Account[]) => {
    let score: CalculatedScore<Record<string, number>>;

    const assets = user.reduce(
      (sum: Record<string, number>, { total }: Account) => {
        total.reduce(
          (sum: Record<string, number>, { currency, amount }) => {
            sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
          },
          sum,
        );
        return sum;
      },
      {},
    );

    const currencies = Object.keys(assets).filter(
      (currency) =>
        currency !== "ADA" && assets[currency]
    );
    if (!currencies.length) {
      score = [0, assets];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.userAccounts * currencies.filter(
      (currency) =>
        assets[currency] < 0
    ).length / currencies.length;

    score = [weight, assets];
    return Effect.succeed(score);
  };

const _calcOtherAccountsWeight =
  (other: readonly Account[]) => {
    let score: CalculatedScore<Record<string, number>>;

    const assets = other.reduce(
      (sum: Record<string, number>, { total }: Account) => {
        total.reduce(
          (sum, { currency, amount }) => {
            sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
          },
          sum,
        );
        return sum;
      },
      {},
    );

    const amounts = Object.values(assets);
    if (!amounts.length) {
      score = [0, assets];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.otherAccounts * amounts.filter(
      (amount) =>
        amount > 0
    ).length / amounts.length;

    score = [weight, assets];
    return Effect.succeed(score);
  };

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) => {
    let score: CalculatedScore<undefined>;

    const weight = metadata.length ? 0 : WEIGHTING.metadata;

    score = [weight, undefined];
    return Effect.succeed(score);
  };
