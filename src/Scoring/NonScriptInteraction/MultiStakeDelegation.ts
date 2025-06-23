import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, PoolMetadata, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  stakeDelegation: .35,
  userAccounts: .20,
  otherAccounts: .15,
  metadata: .30,
} as const;

export const MultiStakeDelegation = {
  score:
    (
      { accounts, metadata }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const weights =
          yield* Effect.all([
            _calcStakeDelegationWeight(txInfo, addressDetails.stakeCredential?.hash),
            _calcUserAccountsWeight(accounts.user),
            _calcOtherAccountsWeight(accounts.other),
            _calcMetadataWeight(metadata, txInfo),
          ]);

        const description = "Delegated stake to multiple pools";
        const type = "multi_stake_delegation";

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcStakeDelegationWeight =
  (txInfo: TransactionInfo, stakeAddress?: string) =>
    Effect.gen(function* () {
      let score: CalculatedScore<PoolMetadata | undefined>;

      const weight = stakeAddress && txInfo.delegation_count > 1
        ? WEIGHTING.stakeDelegation
        : 0;

      score = [weight, undefined];
      return score;
    });

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

const _calcMetadataWeight =
  (metadata: Transaction["metadata"], txInfo: TransactionInfo) => {
    let score: CalculatedScore<undefined>;

    if (!metadata.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const label6862 = metadata.filter(
      ({ label }) =>
        label === "6862"
    );
    if (!label6862.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const withPools = label6862.find(
      ({ json_metadata }) =>
        json_metadata?.pools?.length > 1
    );
    const poolCount = withPools?.json_metadata.pools.length ?? 0;
    if (!poolCount) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const min = Math.min(poolCount, txInfo.delegation_count);
    const max = Math.max(poolCount, txInfo.delegation_count);
    if (!max) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const weight = WEIGHTING.metadata * min / max / label6862.length;

    score = [weight, undefined];
    return Effect.succeed(score);
  };
