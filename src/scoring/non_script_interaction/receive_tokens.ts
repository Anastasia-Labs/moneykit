// type: receive_tokens
// description: Received #.## TokenA, #.## TokenB and #.## TokenC

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total with positive amounts
// other.role are Unknown Addresses
// no withdrawal
// no metadata
const weighting = {
  userAccounts: .45,
  otherAccounts: .30,
  withdrawal: .20,
  metadata: .05,
};

export async function score(
  { accounts, metadata, withdrawal_amount, network_fee }: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcW1(accounts.user),
    calcW2(accounts.other),
    calcW3(withdrawal_amount),
    calcW4(metadata),
  ]);

  const totalTokens: Record<string, number> = {};

  const [, inputTokens] = weights[0];

  Object.keys(inputTokens).forEach(
    (currency) => {
      if (currency !== "ADA")
        totalTokens[currency] = (totalTokens[currency] ?? 0) + inputTokens[currency];
    });

  const receiveTokens = Object.keys(totalTokens)
    .filter(
      (currency) =>
        totalTokens[currency] > 0
    )
    .map(
      (currency) =>
        util.formatAmount(totalTokens[currency], currency),
    );

  const description = `Received ${util.joinWords(receiveTokens)}`.trim();
  const type = "receive_tokens";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * Input amounts should be positive.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user: Account[]): Promise<
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

  const amounts = Object.values(assets);
  if (!amounts.length) return [0, assets];

  const negativesCount = amounts.filter(
    (amount) =>
      amount > 0
  ).length;
  return [amounts.length > 1 // to differentiate with receive_ada
    ? weighting.userAccounts * negativesCount / amounts.length
    : 0, assets];
}

/**
 * Output amounts should be negative.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other: Account[]): Promise<
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

  // filter out ADA to differentiate with receive_ada
  const currencies = Object.keys(assets).filter(
    (currency) =>
      currency !== "ADA" && assets[currency]
  );
  if (!currencies.length) return [0, assets];

  const negativesCount = currencies.filter(
    (currency) =>
      assets[currency] < 0
  ).length;
  return [weighting.otherAccounts * negativesCount / currencies.length, assets];
}

/**
 * It is impossible to withdraw as a beneficiary,
 * the sender may withdraw their stake rewards but not the receivers.
 * 
 * @param withdrawal Whether there's some withdrawal associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcW3(withdrawal?: Asset): Promise<CalculatedScore<undefined>> {
  return [withdrawal ? 0 : weighting.withdrawal, undefined];
}

/**
 * The sender can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW4(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [metadata.length ? 0 : weighting.metadata, undefined];
}
