// type: PASSTHROUGH | amm_dex
// description: Created a swap transaction on Wingriders

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { lucid, util } from "../../util/_";

// user accounts:
// - script address with positive amounts
// - non-script address with negative amounts
// metadata: { label:"674", json_metadata:{ msg:"WingRiders: ... Swap" } }
const weighting = {
  userAccounts: .75,
  metadata: .25,
};

export async function score(
  intermediaryTx: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcW1(intermediaryTx.accounts.user),
    calcW2(intermediaryTx.metadata),
  ]);

  const description = "Created a swap transaction on Wingriders";
  const type = intermediaryTx.type === `${undefined}`
    ? "amm_dex"
    : intermediaryTx.type;

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There must be a user script address with positive NonLP amounts,
 * and a non-script address with negative NonLP amounts.
 * 
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user: Account[]): Promise<
  CalculatedScore<undefined>
> {
  const scriptTotal: Record<string, number> = {};
  const nonScriptTotal: Record<string, number> = {};

  for (const account of user) {
    try {
      const { paymentCredential, stakeCredential } =
        await lucid.getAddressDetails(account.address);
      if (paymentCredential?.type === "Script"
        || stakeCredential?.type === "Script") {
        for (const { currency, amount } of account.total) {
          const maybeLP = currency.includes("-LPT-");
          if (maybeLP || amount < 0) continue; // skip LP Tokens or negative amounts
          scriptTotal[currency] = (scriptTotal[currency] ?? 0) + amount;
        }
      } else {
        for (const { currency, amount } of account.total) {
          const maybeLP = currency.includes("-LPT-");
          if (maybeLP || amount > 0) continue; // skip LP Tokens or positive amounts
          nonScriptTotal[currency] = (nonScriptTotal[currency] ?? 0) + amount;
        }
      }
    } catch {
      continue;
    }
  }

  return [
    Object.keys(scriptTotal).length && Object.keys(nonScriptTotal).length
      ? weighting.userAccounts
      : 0,
    undefined,
  ];
}

/**
 * There should be metadata with msg:"WingRiders: ... Swap"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW2(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [
    weighting.metadata * util
      .weighMetadataMsg(
        "674",
        "WingRiders Swap".split(" "),
        metadata,
      ),
    undefined,
  ];
}
