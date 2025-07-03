// type: PASSTHROUGH | amm_dex
// description: Withdrew #.## TokenA and #.## TokenB from XXX-YYY pool on Wingriders

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total 1 or more NonADA with positive amount
//
// other.role there's a Wingriders Request address with negative LPT amount
// that points to an Unknown Script which contains the withdrawal amounts
//
// no withdrawal
// no metadata
const weighting = {
  userAccounts: .10,
  otherAccounts: .80,
  withdrawal: .05,
  metadata: .05,
};

export async function score(
  intermediaryTx: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcUserAccountsWeight(intermediaryTx.accounts.user),
    calcOtherAccountsWeight(intermediaryTx.accounts.other),
    calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, scTotal] = weights[1];

  if (scTotal?.length) {
    const tokens = scTotal.filter(
      ({ currency }: Asset) =>
        !currency.includes("-LPT-")
    ).map(
      ({ currency, amount }: Asset) =>
        util.formatAmount(-amount, currency),
    );

    const lps = scTotal.filter(
      ({ currency }: Asset) =>
        currency.includes("-LPT-")
    ).map(
      ({ currency }: Asset) =>
        currency
          .replace("WR-LPT-", "")
          .replaceAll("/", "-")
    );

    const description = `Withdrew ${util.joinWords(tokens)} from ${util.joinWords(lps)} ${lps.length > 1 ? "pools" : "pool"} on Wingriders`;
    const type = intermediaryTx.type === `${undefined}`
      ? "amm_dex"
      : intermediaryTx.type;

    const score = util.sumWeights(weights);

    return { type, description, score };
  }
  else {
    return {
      type: intermediaryTx.type,
      description: intermediaryTx.description,
      score: 0,
    };
  }
}

/**
 * There should be more than 1 token with positive amount.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<
  CalculatedScore<undefined>
> {
  const assets = user.reduce(
    (sum, { total }) => {
      total.reduce(
        (sum, { currency, amount }) => {
          sum[currency] = (sum[currency] ?? 0) + amount;
          return sum;
        },
        sum,
      );
      return sum;
    },
    {} as Record<string, number>,
  );

  return [weighting.userAccounts * Math.min(Object.keys(assets)
    .filter(
      (currency) =>
        assets[currency] > 0
    ).length, 2) / 2, undefined];
}

/**
 * There should be a Wingriders Request address with negative LPT amount
 * that points to an Unknown Script which contains the withdrawal amounts.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<
  CalculatedScore<Asset[] | undefined>
> {
  if (!other.length) return [0, undefined];

  let score = 0;

  const wingridersRequestAddress = other.find(
    ({ role }) =>
      role === "Wingriders Request"
  );
  if (wingridersRequestAddress) score += 1;

  const lpt = wingridersRequestAddress?.total.find(
    ({ currency }) =>
      currency.includes("-LPT-")
  );
  if (lpt) score += 1;

  const wingridersScriptAddress = other.find(
    ({ role, total }) =>
      role !== "Unknown Address" && total.find(
        ({ currency, amount }) =>
          currency === lpt?.currency && -amount === lpt?.amount
      )
  );
  if (wingridersScriptAddress) score += 1;

  return [
    weighting.otherAccounts * Math.min(score / 3, 1),
    wingridersScriptAddress?.total,
  ];
}

/**
 * The user will never withdraw as a the transaction is executed by some batchers.
 * @param withdrawal Whether there's some withdrawal associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcWithdrawalWeight(withdrawal?: Asset): Promise<CalculatedScore<undefined>> {
  return [withdrawal ? 0 : weighting.withdrawal, undefined];
}

/**
 * There should be no metadata.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [metadata.length ? 0 : weighting.metadata, undefined];
}
