import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Asset, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  userAccounts: .10,
  otherAccounts: .80,
  withdrawal: .05,
  metadata: .05,
} as const;

export const WingridersLiquidityRemovalTx = {
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
          userAccountsWeight,
          otherAccountsWeight,
          withdrawalWeight,
          metadataWeight,
        ] =
          yield* Effect.all([
            _calcUserAccountsWeight(intermediaryTx.accounts.user),
            _calcOtherAccountsWeight(intermediaryTx.accounts.other),
            _calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
            _calcMetadataWeight(intermediaryTx.metadata),
          ]);

        const [, scTotal] = otherAccountsWeight;

        if (scTotal?.length) {
          const tokens =
            yield* Effect.all(
              scTotal
                .filter(
                  ({ currency }) =>
                    !currency.includes("-LPT-")
                )
                .map(
                  ({ currency, amount }) =>
                    Util.formatAmount(-amount, currency)
                )
            );

          const lps =
            scTotal
              .filter(
                ({ currency }) =>
                  currency.includes("-LPT-")
              )
              .map(
                ({ currency }) =>
                  currency
                    .replace("WR-LPT-", "")
                    .replaceAll("/", "-")
              );

          const description = `Withdrew ${yield* Util
            .joinWords(tokens)} from ${yield* Util
              .joinWords(lps)} ${lps.length > 1
                ? "pools"
                : "pool"} on Wingriders`;
          const type = intermediaryTx.type === `${undefined}`
            ? "amm_dex"
            : intermediaryTx.type;

          const weights = [
            userAccountsWeight,
            otherAccountsWeight,
            withdrawalWeight,
            metadataWeight,
          ];

          const score = yield* Util.sumWeights(weights);

          const txScore: TransactionScore = { type, description, score };
          return txScore;
        }
        else {
          const txScore: TransactionScore = {
            type: intermediaryTx.type,
            description: intermediaryTx.description,
            score: 0.00,
          };
          return txScore;
        }
      })
};

const _calcUserAccountsWeight =
  (user: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

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

    const positiveAssetsCount = Object.keys(assets).filter(
      (currency) =>
        assets[currency] > 0
    ).length;

    const weight =
      WEIGHTING.userAccounts * Math.min(positiveAssetsCount, 2) / 2;

    score = [weight, undefined];
    return Effect.succeed(score);
  };

const _calcOtherAccountsWeight =
  (other: readonly Account[]) => {
    let score: CalculatedScore<readonly Asset[] | undefined>;

    if (!other.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    let point = 0;

    const wingridersRequestAddress =
      other.find(
        ({ role }) =>
          role === "Wingriders Request"
      );
    if (wingridersRequestAddress) point += 1;

    const lpt =
      wingridersRequestAddress?.total.find(
        ({ currency }) =>
          currency.includes("-LPT-")
      );
    if (lpt) point += 1;

    const wingridersScriptAddress =
      other.find(
        ({ role, total }) =>
          role !== "Unknown Address" && total.find(
            ({ currency, amount }) =>
              currency === lpt?.currency && -amount === lpt?.amount
          )
      );
    if (wingridersScriptAddress) point += 1;

    const weight = WEIGHTING.otherAccounts * Math.min(point / 3, 1);

    score = [weight, wingridersRequestAddress?.total];
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
