// type: PASSTHROUGH | amm_dex
// description: Swapped #.## TokenA for #.## TokenB on Minswap
// NOTE: Right now, this will only work properly with swap ADA for #.## Tokens

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { bf, lucid, util } from "../../util/_";
import { CalculatedScore, TransactionScore } from "../../types/_";

// user accounts with:
// - negative amounts at script address
// - positive amounts at non-script address
//
// no withdrawal
//
// metadata: { label:"674", json_metadata:{ msg:"Minswap: Order Executed" } }
const weighting = {
  userAccounts: .60,
  withdrawal: .30,
  metadata: .10,
};

export async function score(
  intermediaryTx: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcUserAccountsWeight(intermediaryTx.accounts.user, txUTXOs),
    calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, paidLovelaceforTokens] = weights[0];

  if (paidLovelaceforTokens?.length === 2) {
    const [paidLovelace, forTokens] = paidLovelaceforTokens;

    const fromADA = paidLovelace / 1_000000;

    const toTokens = Object.keys(forTokens)
      .filter(
        (currency) =>
          currency !== "ADA"
      )
      .map(
        (currency) =>
          util.formatAmount(forTokens[currency], currency),
      );

    let description = intermediaryTx.description;
    let divider = 0;

    if (fromADA > 0 && toTokens.length) {
      description = `Swapped ${util.formatAmount(fromADA, "ADA")} for ${util.joinWords(toTokens)} on Minswap`;
      divider = 1;
    }
    else if (fromADA > 0) {
      description = `Swapped ${util.formatAmount(fromADA, "ADA")} on Minswap`;
      divider = 2;
    }
    else if (toTokens.length) {
      description = `Swapped for ${util.joinWords(toTokens)} on Minswap`;
      divider = 2;
    }
    else {
      description = "Swapped tokens on Minswap";
      divider = 4;
    }

    const type = intermediaryTx.type === `${undefined}`
      ? "amm_dex"
      : intermediaryTx.type;

    const score = util.sumWeights(weights) / divider;

    return { type, description, score };
  } else {
    return {
      type: intermediaryTx.type,
      description: intermediaryTx.description,
      score: 0,
    };
  }
}

/**
 * There must be a user script address with negative NonLP amounts,
 * and a non-script address with positive NonLP amounts.
 * 
 * @param user User Accounts
 * @param txUTXOs Blockfrost TransactionUTXOs
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(
  user: Account[],
  txUTXOs: TransactionUTXOs,
): Promise<
  CalculatedScore<[number, Record<string, number>] | undefined>
> {
  try {
    const scriptAddresses = [];
    const scriptTotal: Record<string, number> = {};

    const nonScriptAddresses = [];
    const nonScriptTotal: Record<string, number> = {};

    for (const account of user) {
      try {
        const { paymentCredential, stakeCredential } =
          await lucid.getAddressDetails(account.address);
        if (paymentCredential?.type === "Script" ||
          stakeCredential?.type === "Script") {
          for (const { currency, amount } of account.total) {
            const maybeLP = currency.endsWith(" LP");
            if (maybeLP || amount > 0) continue; // skip LPs or positive amounts
            scriptTotal[currency] = (scriptTotal[currency] ?? 0) + amount;
            scriptAddresses.push(account.address);
          }
        } else {
          for (const { currency, amount } of account.total) {
            const maybeLP = currency.endsWith(" LP");
            if (maybeLP || amount < 0) continue; // skip LPs or negative amounts
            nonScriptTotal[currency] = (nonScriptTotal[currency] ?? 0) + amount;
            nonScriptAddresses.push(account.address);
          }
        }
      } catch {
        continue;
      }
    }

    if (scriptAddresses.length !== 1) return [0, undefined];
    const [scriptAddress] = scriptAddresses;
    const datumHash = txUTXOs.inputs.find(
      ({ address }) =>
        address === scriptAddress
    )?.data_hash;
    if (!datumHash) return [0, undefined];

    const { json_value } = await bf.getDatum(datumHash);
    const paidLovelace = json_value.fields[6].fields[1].fields[0].int;
    return [
      Object.keys(scriptTotal).length && Object.keys(nonScriptTotal).length
        ? weighting.userAccounts
        : 0,
      [paidLovelace, nonScriptTotal],
    ];
  } catch {
    return [0, undefined];
  }
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
 * There should be metadata with msg:"Minswap: Order Executed"
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
        "Minswap Order Executed".split(" "),
        metadata,
      ),
    undefined,
  ];
}
