import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Account, Transaction } from "../../Domain/Manifest";
import { CalculatedScore, TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";
import { Util } from "../../Service/Util";

const WEIGHTING = {
  userAccounts: .40,
  otherAccounts: .50,
  metadata: .10,
} as const;

export const WingridersLiquidityRemovalCreation = {
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
          metadataWeight,
        ] =
          yield* Effect.all([
            _calcUserAccountsWeight(intermediaryTx.accounts.user),
            _calcOtherAccountsWeight(intermediaryTx.accounts.other),
            _calcMetadataWeight(intermediaryTx.metadata),
          ]);

        const [, pairTokens] = userAccountsWeight;
        const description = pairTokens
          ? `Created a liquidity removal order (withdraw ${pairTokens}) on Wingriders`
          : "Created a liquidity removal order on Wingriders";
        const type = intermediaryTx.type === `${undefined}`
          ? "amm_dex"
          : intermediaryTx.type;

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
    let score: CalculatedScore<string | undefined>;

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
      score = [0, undefined];
      return Effect.succeed(score);
    }

    const pairCount = currencies.filter(
      (currency) =>
        // LPT Must be negative:
        (currency.includes("-LPT-") && assets[currency] < 0)
        || currency === "ADA"
    ).length;

    const pairTokens = currencies.find(
      (currency) =>
        // find negative WR-LPT:
        currency.startsWith("WR-LPT") && assets[currency] < 0
    );

    const weight =
      WEIGHTING.userAccounts * pairCount / currencies.length;

    const additionalData =
      pairTokens?.replace("WR-LPT", "")
        .replaceAll("/", "-");

    score = [weight, additionalData];
    return Effect.succeed(score);
  };

const _calcOtherAccountsWeight =
  (other: readonly Account[]) => {
    let score: CalculatedScore<undefined>;

    if (!other.length) {
      score = [0, undefined];
      return Effect.succeed(score);
    }

    let depositLpAddressCount = 0;
    for (const { role, total } of other) {
      const wingridersScriptAddress =
        role.startsWith("Wingriders")
        && total.length === 2
        && total.every(
          ({ currency, amount }) =>
            (currency.startsWith("WR-LPT") || currency === "ADA")
            && amount > 0
        );
      if (wingridersScriptAddress)
        depositLpAddressCount += 1;
    }

    const weight =
      WEIGHTING.otherAccounts * depositLpAddressCount / other.length;

    score = [weight, undefined];
    return Effect.succeed(score);
  };

const _calcMetadataWeight =
  (metadata: Transaction["metadata"]) =>
    Effect.gen(function* () {
      let score: CalculatedScore<undefined>;

      const metadataWeight =
        yield* Util.weighMetadataMsg(
          "674",
          "WingRiders liquidity".split(" "),
          metadata,
        );
      const weight = metadataWeight * WEIGHTING.metadata;

      score = [weight, undefined];
      return score;
    });
