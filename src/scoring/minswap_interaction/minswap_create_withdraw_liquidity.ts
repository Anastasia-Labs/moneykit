// type: PASSTHROUGH | amm_dex
// description: Created a withdraw {LP Tokens from farm | liquidity order} on Minswap

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { bf, lucid, util } from "../../util/_";
import { CalculatedScore, TransactionScore } from "../../types/_";

// user.total with positive asset100000000000000000000000000000000000044
// other.role there's a Minswap Yield Farming... with negative asset1...44
// metadata { label:"674", json_metadata:{ msg:"Minswap: ... Withdraw liquidity" } }
const weighting = {
  userAccounts: .40,
  otherAccounts: .40,
  metadata: .20,
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
    calcOtherAccountsWeight(intermediaryTx.accounts.other, txUTXOs),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, qty] = weights[0];
  const [, farm] = weights[1];

  const description = `Created a withdraw ${qty && farm
    ? `${util.formatAmount(qty, "LP Token")} from ${farm} farm`
    : "liquidity order"} on Minswap`;
  const type = qty && farm ? "yield_farming" : intermediaryTx.type;

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There should be positive asset100000000000000000000000000000000000044
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<CalculatedScore<number>> {
  const lpTokens = user.reduce(
    (sum, { total }) =>
      total.reduce(
        (sum, { currency, amount }) => {
          if (
            amount > 0 && (
              currency.endsWith(" LP") ||
              (currency.startsWith("asset") && currency.length === 44)
            )
          ) sum += amount;
          return sum;
        },
        sum,
      ),
    0,
  );
  return [lpTokens ? weighting.userAccounts : 0, lpTokens];
}

/**
 * There should be a Minswap Yield Farming... with negative asset1...44,
 * if there's no other account then score:0
 * 
 * @param other Other Accounts
 * @param txUTXOs Blockfrost TransactionUTXOs
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(
  other: Account[],
  txUTXOs: TransactionUTXOs,
): Promise<
  CalculatedScore<string | undefined>
> {
  if (!other.length) return [0, undefined];

  const yieldFarming = other.find(
    ({ role, total }) =>
      role.startsWith("Minswap Yield Farming") && total.find(
        ({ currency, amount }) =>
          amount < 0 && (
            currency.endsWith(" LP") ||
            (currency.startsWith("asset") && currency.length === 44)
          )
      )
  );
  if (!yieldFarming) return [0, undefined];

  let farmName: string | undefined = undefined;
  for (const { address } of other) {
    try {
      if (address === yieldFarming.address) {
        const utxo = txUTXOs.inputs.find(
          (input) =>
            input.address === address
        );
        if (!utxo?.data_hash) continue;

        const { json_value } = await bf.getDatum(utxo.data_hash);
        farmName = await lucid.toText(
          json_value.fields[3].list[0].fields[0].fields[1].bytes
        );
        if (farmName) break;
      }
    } catch {
      continue;
    }
  }
  return [farmName ? weighting.otherAccounts : 0, farmName];
}

/**
 * There should be metadata with msg:"Minswap: ... Withdraw liquidity"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [
    weighting.metadata * util
      .weighMetadataMsg(
        "674",
        "Minswap Withdraw liquidity".split(" "),
        metadata,
      ),
    undefined,
  ];
}
