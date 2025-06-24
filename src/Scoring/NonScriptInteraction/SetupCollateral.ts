import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Asset, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Lucid } from "../../Service/Lucid";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  output5ada: .50,
  userAccounts: .45,
  metadata: .05,
} as const;

export const SetupCollateral = {
  score:
    (
      { accounts, metadata, network_fee }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const weights =
          yield* Effect.all([
            _calcOutput5AdaWeight(txUTXOs, addressDetails),
            _calcUserAccountsWeight(accounts.user, network_fee),
            _calcMetadataWeight(metadata),
          ]);

        const description = "Setup Collateral";
        const type = "setup_collateral";

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcOutput5AdaWeight =
  (txUTXOs: TransactionUTXOs, addressDetails: AddressDetails) =>
    Effect.gen(function* () {
      let score: CalculatedScore<undefined>;

      for (const { address, amount } of txUTXOs.outputs) {
        const weight =
          yield* Effect.gen(function* () {
            const pk =
              yield* Lucid.paymentCredentialOf(address);
            const sk =
              yield* Lucid.stakeCredentialOf(address);

            if (
              pk.hash !== addressDetails.paymentCredential?.hash &&
              sk.hash !== addressDetails.stakeCredential?.hash
            ) return; // continue;

            for (const { unit, quantity } of amount) {
              if (unit === "lovelace" && quantity === "5000000")
                return WEIGHTING.output5ada;
            }
          }).pipe(
            Effect.catchAllCause(
              () =>
                Effect.succeed(undefined) // continue;
            )
          );

        if (!weight) continue;

        score = [weight, undefined];
        return score;
      }

      score = [0, undefined];
      return score;
    });

const _calcUserAccountsWeight =
  (user: readonly Account[], networkFee: Asset) => {
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

    const weight = assets.ADA + networkFee.amount ? 0 : WEIGHTING.userAccounts;

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
