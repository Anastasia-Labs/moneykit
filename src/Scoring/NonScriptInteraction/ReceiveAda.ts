import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Asset, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  userAccounts: .45,
  otherAccounts: .30,
  withdrawal: .20,
  metadata: .05,
} as const;

export const ReceiveAda = {
  score:
    (
      { accounts, withdrawal_amount, metadata }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const [
          userAccountsWeight,
          otherAccountsWeight,
          withdrawalWeight,
          metadataWeight,
        ] =
          yield* Effect.all([
            _calcUserAccountsWeight(accounts.user),
            _calcOtherAccountsWeight(accounts.other),
            _calcWithdrawalWeight(withdrawal_amount),
            _calcMetadataWeight(metadata),
          ]);

        const [, amount] = userAccountsWeight;
        const description = `Received ${yield* Util.formatAmount(amount, "ADA")}`;
        const type = "receive_ada";

        const weights = [
          userAccountsWeight,
          otherAccountsWeight,
          withdrawalWeight,
          metadataWeight,
        ];

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcUserAccountsWeight =
  (user: readonly Account[]) => {
    let score: CalculatedScore<number>;

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

    const currencies = Object.keys(assets);
    if (!currencies.length || assets.ADA < 0) {
      score = [0, assets.ADA];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.userAccounts * currencies.filter(
      (currency) =>
        currency === "ADA"
    ).length / currencies.length;

    score = [weight, assets.ADA];
    return Effect.succeed(score);
  };

const _calcOtherAccountsWeight =
  (other: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

    if (!other.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.otherAccounts * other.filter(
      ({ role }) =>
        role === "Unknown Address"
    ).length / other.length;

    score = [weight, undefined];
    return Effect.succeed(score);
  };

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
