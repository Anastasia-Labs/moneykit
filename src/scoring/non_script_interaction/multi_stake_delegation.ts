// type: multi_stake_delegation
// description: Delegated stake to multiple pools

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// txInfo.delegation_count > 1
// user.total currency:ADA amount:-#.##
// other.role.length === 0
// metadata label:6862
const weighting = {
  stakeDelegation: .35,
  userAccounts: .20,
  otherAccounts: .15,
  metadata: .30,
};

export async function score(
  { accounts, metadata }: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcStakeDelegationWeight(txInfo, lucidAddressDetails.stakeCredential?.hash),
    calcUserAccountsWeight(accounts.user),
    calcOtherAccountsWeight(accounts.other),
    calcMetadataWeight(metadata, txInfo),
  ]);

  const description = "Delegated stake to multiple pools";
  const type = "multi_stake_delegation";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * Delegation count must be greater than 1
 * @param txInfo Blockfrost TxInfo
 * @param stakeAddress The User Bech32 StakeAddress
 */
async function calcStakeDelegationWeight(
  txInfo: TransactionInfo,
  stakeAddress?: string,
): Promise<CalculatedScore<undefined>> {
  return [
    stakeAddress && txInfo.delegation_count > 1 ? weighting.stakeDelegation : 0,
    undefined,
  ];
}

/**
 * There may be more than 1 associated addresses,
 * but the AGGREGATE movement should only be ADA.
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

  const withMovement = currencies.filter(
    (currency) =>
      assets[currency]
  ).length;

  return [weighting.userAccounts * adaCount / withMovement, undefined];
}

/**
 * Should be no other account.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<CalculatedScore<undefined>> {
  return [other.length ? 0 : weighting.otherAccounts, undefined];
}

/**
 * label:6862 with multiple pools.
 * @param metadata Transaction Metadata
 * @param txInfo Blockfrost TxInfo
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(
  metadata: Record<string, any>[],
  txInfo: TransactionInfo,
): Promise<
  CalculatedScore<undefined>
> {
  if (!metadata.length) return [0, undefined];

  const label6862 = metadata.filter(
    ({ label }) =>
      label === "6862"
  );
  if (!label6862.length) return [0, undefined];

  const withPools = label6862.find(
    ({ json_metadata }) =>
      json_metadata?.pools?.length > 1
  );
  const poolCount = withPools?.json_metadata.pools.length ?? 0;
  if (!poolCount) return [0, undefined];

  const min = Math.min(poolCount, txInfo.delegation_count);
  const max = Math.max(poolCount, txInfo.delegation_count);
  if (!max) return [0, undefined];

  return [weighting.metadata * min / max / label6862.length, undefined];
}
