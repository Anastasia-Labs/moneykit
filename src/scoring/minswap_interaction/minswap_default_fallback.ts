// type: PASSTHROUGH | amm_dex
// description: Executed an order on Minswap

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// other.role there's a Minswap address
// no withdrawal
// metadata { label:"674", json_metadata:{ msg:"Minswap: ..." } }
const weighting = {
  otherAccounts: .50,
  withdrawal: .15,
  metadata: .35,
};

export async function score(
  intermediaryTx: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcOtherAccountsWeight(intermediaryTx.accounts.other),
    calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const description = "Executed an order on Minswap";
  const type = intermediaryTx.type === `${undefined}`
    ? "amm_dex"
    : intermediaryTx.type;

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There should be a NonKeyAddress, if there's no other account then score:0
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<
  CalculatedScore<undefined>
> {
  if (!other.length) return [0, undefined];

  const hasMinswap = other.find(
    ({ role }) =>
      role.includes("Minswap")
  );
  if (hasMinswap) return [weighting.otherAccounts, undefined];

  const hasScript = other.find(
    ({ role }) =>
      role === "Unknown Script"
  );
  if (hasScript) return [weighting.otherAccounts / 2, undefined];

  return [0, undefined];
}

/**
 * The user will never withdraw as a the transaction is executed by some batchers.
 * @param withdrawal Whether there's some withdrawal associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcWithdrawalWeight(withdrawal?: Asset): Promise<
  CalculatedScore<undefined>
> {
  return [withdrawal ? 0 : weighting.withdrawal, undefined];
}

/**
 * There could be metadata with msg:"Minswap: ..."
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [
    weighting.metadata * util
      .weighMetadataMsg("674", ["Minswap"], metadata),
    undefined,
  ];
}
