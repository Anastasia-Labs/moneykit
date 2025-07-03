// type: setup_collateral
// description: Setup Collateral

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { lucid, util } from "../../util/_";

// output 5 ADA to user own account
// user.total == network_fee
// no other account
// no metadata
const weighting = {
  output5ada: .50,
  userAccounts: .45,
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
    calcOutput5AdaWeight(txUTXOs, lucidAddressDetails),
    calcUserAccountsWeight(accounts.user, network_fee),
    calcMetadataWeight(metadata),
  ]);

  const description = "Setup Collateral";
  const type = "setup_collateral";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There must be an output of 5 ADA to user own account.
 * @param txUTXOs Blockfrost Transaction UTXOs
 * @param lucidAddressDetails Lucid User AddressDetails
 * @returns [Score, AdditionalData]
 */
async function calcOutput5AdaWeight(
  txUTXOs: TransactionUTXOs,
  lucidAddressDetails: AddressDetails,
): Promise<
  CalculatedScore<undefined>
> {
  for (const { address, amount } of txUTXOs.outputs) {
    try {
      const pk = await lucid.paymentCredentialOf(address);
      const sk = await lucid.stakeCredentialOf(address);
      if (
        pk?.hash !== lucidAddressDetails.paymentCredential?.hash &&
        sk?.hash !== lucidAddressDetails.stakeCredential?.hash
      ) continue;

      for (const { unit, quantity } of amount) {
        if (unit === "lovelace" && quantity === "5000000")
          return [weighting.output5ada, undefined];
      }
    } catch {
      continue;
    }
  }
  return [0, undefined];
}

/**
 * Input amounts equals to network fee for single address wallets.
 * @param user User Accounts
 * @param networkFee Network Fee
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(
  user: Account[],
  networkFee: Asset,
): Promise<
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

  return [assets.ADA + networkFee.amount ? 0 : weighting.userAccounts, undefined];
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
