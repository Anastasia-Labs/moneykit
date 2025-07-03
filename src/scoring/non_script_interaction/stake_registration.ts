// type: stake_registration
// description: Stake Registration

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// txInfo.stake_cert_count && !txInfo.delegation_count
// user.total.length === 1 (currency:ADA,amount:-#.##)
// other.role.length === 0
// unlikely to have a withdrawal
// no metadata
const weighting = {
  stakeRegistration: .50,
  userAccounts: .20,
  otherAccounts: .15,
  withdrawal: .10,
  metadata: .05,
};

export async function score(
  { accounts, metadata, withdrawal_amount }: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcStakeRegistrationWeight(txInfo),
    calcUserAccountsWeight(accounts.user),
    calcOtherAccountsWeight(accounts.other),
    calcWithdrawalWeight(withdrawal_amount),
    calcMetadataWeight(metadata),
  ]);

  const description = "Stake Registration";
  const type = "stake_registration";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * Stake certs count must be greater than 0 and Delegation count must be 0
 * @param txInfo Blockfrost TxInfo
 */
async function calcStakeRegistrationWeight(txInfo: TransactionInfo): Promise<
  CalculatedScore<undefined>
> {
  return [
    txInfo.stake_cert_count && !txInfo.delegation_count
      ? weighting.stakeRegistration
      : 0,
    undefined,
  ];
}

/**
 * There may be more than 1 associated addresses,
 * but the aggregate currency should only be ADA.
 * 
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

  const currencies = Object.keys(assets);
  if (!currencies.length || assets.ADA > 0) return [0, undefined];

  const adaCount = currencies.filter(
    (currency) =>
      currency === "ADA"
  ).length;
  return [weighting.userAccounts * adaCount / currencies.length, undefined];
}

/**
 * No other account.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<
  CalculatedScore<undefined>
> {
  return [other.length ? 0 : weighting.otherAccounts, undefined];
}

/**
 * It's unlikely to have a withdrawal.
 * @param withdrawal Whether there's some withdrawal associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcWithdrawalWeight(withdrawal?: Asset): Promise<
  CalculatedScore<undefined>
> {
  return [withdrawal ? 0 : weighting.withdrawal, undefined];
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
