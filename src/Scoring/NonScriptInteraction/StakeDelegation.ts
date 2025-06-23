import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, Blockfrost, PoolMetadata, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Lucid } from "../../Service/Lucid";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  stakeDelegation: .85,
  userAccounts: .10,
  metadata: .05,
} as const;

export const StakeDelegation = {
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
          stakeDelegationWeight,
          userAccountsWeight,
          metadataWeight,
        ] =
          yield* Effect.all([
            _calcStakeDelegationWeight(txInfo, addressDetails.stakeCredential?.hash),
            _calcUserAccountsWeight(accounts.user),
            _calcMetadataWeight(metadata),
          ]);

        const [, poolMetadata] = stakeDelegationWeight;
        const poolTicker =
          poolMetadata?.ticker
            ? `[${poolMetadata.ticker}]`
            : undefined;
        const poolName =
          poolMetadata?.name
            ? (poolTicker ?
              `${poolTicker} ${poolMetadata.name}`
              : poolMetadata.name)
            : undefined;
        const description = poolName
          ? `Delegated stake to pool: ${poolName}`
          : "Stake Delegation";
        const type = "stake_delegation";

        const weights = [
          stakeDelegationWeight,
          userAccountsWeight,
          metadataWeight,
        ];

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcStakeDelegationWeight =
  (txInfo: TransactionInfo, stakeAddress?: string) =>
    Effect.gen(function* () {
      let score: CalculatedScore<PoolMetadata | undefined>;

      if (!stakeAddress) {
        score = [0, undefined];
        return score;
      }

      score =
        yield* Effect.gen(function* () {
          if (txInfo.delegation_count) {
            const delegations =
              yield* Blockfrost.getTransactionDelegations(txInfo.hash);

            for (const { address, pool_id } of delegations) {
              const sk =
                yield* Lucid.stakeCredentialOf(address);

              if (sk.hash === stakeAddress) {
                const poolMetadata =
                  yield* Blockfrost.getPoolMetadata(pool_id);

                score = [WEIGHTING.stakeDelegation, poolMetadata];
                return score;
              }
            }
          }

          // has delegation_count,
          const weight = WEIGHTING.stakeDelegation / 2;
          // but somehow failed to get pool metadata

          score = [weight, undefined];
          return score;
        }).pipe(
          Effect.catchAllCause(
            () => {
              score = [0, undefined];
              return Effect.succeed(score);
            }
          )
        );
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

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) => {
    let score: CalculatedScore<undefined>;

    const weight = metadata.length ? 0 : WEIGHTING.metadata;

    score = [weight, undefined];
    return Effect.succeed(score);
  };
