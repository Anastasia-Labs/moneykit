// type: send_tokens
// description: Sent #.## TokenA, #.## TokenB and #.## TokenC

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total with negative amounts
// other.role are Unknown Addresses
// no metadata
const weighting = {
  userAccounts: .75,
  otherAccounts: .20,
  metadata: .05,
};

export async function score(
  { accounts, metadata, network_fee }: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcUserAccountsWeight(accounts.user),
    calcOtherAccountsWeight(accounts.other),
    calcMetadataWeight(metadata),
  ]);

  const totalTokens: Record<string, number> = {
    // [network_fee.currency]: network_fee.amount,
  };

  const [, inputTokens] = weights[0];

  Object.keys(inputTokens).forEach(
    (currency) => {
      if (currency !== "ADA")
        totalTokens[currency] = (totalTokens[currency] ?? 0) - inputTokens[currency];
    });

  const sendTokens = Object.keys(totalTokens)
    .filter(
      (currency) =>
        totalTokens[currency] > 0
    )
    .map(
      (currency) =>
        util.formatAmount(totalTokens[currency], currency),
    );

  const description = `Sent ${util.joinWords(sendTokens)}`.trim();
  const type = "send_tokens";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * Input amounts should be negative.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<
  CalculatedScore<Record<string, number>>
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

  // filter out ADA to differentiate with send_ada
  const currencies = Object.keys(assets).filter(
    (currency) =>
      currency !== "ADA" && assets[currency]
  );
  if (!currencies.length) return [0, assets];

  const negativesCount = currencies.filter(
    (currency) =>
      assets[currency] < 0
  ).length;
  return [weighting.userAccounts * negativesCount / currencies.length, assets];
}

/**
 * Output amounts should be positive.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<
  CalculatedScore<Record<string, number>>
> {
  const assets = other.reduce(
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

  const amounts = Object.values(assets);
  if (!amounts.length) return [0, assets];

  const positivesCount = amounts.filter(
    (amount) =>
      amount > 0
  ).length;
  return [amounts.length > 1 // to differentiate with send_ada
    ? weighting.otherAccounts * positivesCount / amounts.length
    : 0, assets];
}

/**
 * The user can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [metadata.length ? 0 : weighting.metadata, undefined];
}
