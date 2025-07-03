// type: send_ada
// description: Sent #.## ADA

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total.length === 1 (currency:ADA,amount:-#.##)
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

  const [, amount] = weights[0];
  const description = `Sent ${util.formatAmount(
    amount - network_fee.amount,
    "ADA",
  )}`;
  const type = "send_ada";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There may be more than 1 associated addresses,
 * but the aggregate currency should only be ADA.
 * 
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<
  CalculatedScore<number>
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

  const currencies = Object.keys(assets);
  if (!currencies.length || assets.ADA > 0) return [0, assets.ADA];

  const adaCount = currencies.filter(
    (currency) =>
      currency === "ADA"
  ).length;
  return [weighting.userAccounts * adaCount / currencies.length, -assets.ADA];
}

/**
 * Unknown Address count / other accounts length,
 * if there's no other account then score:0
 * 
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<
  CalculatedScore<undefined>
> {
  if (!other.length) return [0, undefined];

  const nonScriptAddressCount = other.filter(
    ({ role }) =>
      role === "Unknown Address"
  ).length;
  return [weighting.otherAccounts * nonScriptAddressCount / other.length, undefined];
}

/**
 * The sender can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [metadata.length ? 0 : weighting.metadata, undefined];
}
