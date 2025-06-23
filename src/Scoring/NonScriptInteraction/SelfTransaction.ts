import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  userAccounts: .50,
  otherAccounts: .50,
} as const;

export const SelfTransaction = {
  score:
    (
      { accounts }: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        const weights =
          yield* Effect.all([
            _calcUserAccountsWeight(accounts.user),
            _calcOtherAccountsWeight(accounts.other),
          ]);

        const description = "Self Transaction";
        const type = "self_transaction";

        const score = yield* Util.sumWeights(weights);

        const txScore: TransactionScore = { type, description, score };
        return txScore;
      })
};

const _calcUserAccountsWeight =
  (user: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

    const weight = user.length ? WEIGHTING.userAccounts : 0;

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
