import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Asset, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  stakeRegistration: .50,
  userAccounts: .20,
  otherAccounts: .15,
  withdrawal: .10,
  metadata: .05,
} as const;

export const StakeRegistration = {
  score:
    (
      { accounts, withdrawal_amount, metadata }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const weights =
          yield* Effect.all([
            _calcStakeRegistrationWeight(txInfo),
            _calcUserAccountsWeight(accounts.user),
            _calcOtherAccountsWeight(accounts.other),
            _calcWithdrawalWeight(withdrawal_amount),
            _calcMetadataWeight(metadata),
          ]);

        const description = "Stake Registration";
        const type = "stake_registration";

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcStakeRegistrationWeight =
  (txInfo: TransactionInfo) => {
    let score: CalculatedScore<undefined>;

    const weight = txInfo.stake_cert_count && !txInfo.delegation_count
      ? WEIGHTING.stakeRegistration
      : 0;

    score = [weight, undefined];
    return Effect.succeed(score);
  };

const _calcUserAccountsWeight =
  (user: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

    const assets = user.reduce(
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

    const currencies = Object.keys(assets);
    if (!currencies.length || assets.ADA > 0) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.userAccounts * currencies.filter(
      (currency) =>
        currency === "ADA"
    ).length / currencies.length;

    score = [weight, undefined];
    return Effect.succeed(score);
  };

const _calcOtherAccountsWeight =
  (other: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

    const weight = other.length ? 0 : WEIGHTING.otherAccounts;

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
