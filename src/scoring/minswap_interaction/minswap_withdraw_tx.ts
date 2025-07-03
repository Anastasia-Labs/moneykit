// type: PASSTHROUGH | amm_dex
// description: Withdrew {#.## TokenA | and #.## TokenB} from XXX-YYY pool on Minswap

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { lucid, util } from "../../util/_";

// user script address with negative LPs and non-script address with positive amounts
// no withdrawal
// metadata { label:"674", json_metadata:{ msg:"Minswap: Order Executed" } }
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
    calcUserAccountsWeight(intermediaryTx.accounts.user),
    calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, receivedTokensFromLP] = weights[0];

  if (receivedTokensFromLP?.length === 2) {
    const [receivedTokens, fromLP] = receivedTokensFromLP;

    const withdrewTokens = Object.keys(receivedTokens)
      .map(
        (currency) =>
          util.formatAmount(
            receivedTokens[currency] - (currency === "ADA" ? 2 : 0),
            currency,
          ),
      );

    let description = "";
    let divider = 0;

    if (withdrewTokens.length && fromLP.length > 3) {
      description = `Withdrew ${util.joinWords(withdrewTokens)} from ${fromLP.slice(0, fromLP.length - 3)} pool on Minswap`;
      divider = 1;
    } else if (withdrewTokens.length) {
      description = `Withdrew ${util.joinWords(withdrewTokens)} from Minswap`;
      divider = 2;
    } else if (fromLP.length > 3) {
      description = `Withdrew from ${fromLP.slice(0, fromLP.length - 3)} pool on Minswap`;
      divider = 2;
    } else {
      description = "Withdrew from Minswap";
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
 * There must be a user script address with negative LP amounts,
 * and a non-script address with positive amounts.
 * 
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<
  CalculatedScore<[Record<string, number>, string] | undefined>
> {
  const scriptTotal: Record<string, number> = {};
  const nonScriptTotal: Record<string, number> = {};

  for (const account of user) {
    try {
      const { paymentCredential, stakeCredential } =
        await lucid.getAddressDetails(account.address);
      if (paymentCredential?.type === "Script" ||
        stakeCredential?.type === "Script") {
        for (const { currency, amount } of account.total) {
          const nonLP = !currency.endsWith(" LP");
          if (nonLP || amount > 0) continue; // skip NonLP Tokens or positive amounts
          scriptTotal[currency] = (scriptTotal[currency] ?? 0) + amount;
        }
      } else {
        for (const { currency, amount } of account.total) {
          const maybeLP = currency.endsWith(" LP");
          if (maybeLP || amount < 0) continue; // skip LP Tokens or negative amounts
          nonScriptTotal[currency] = (nonScriptTotal[currency] ?? 0) + amount;
        }
      }
    } catch {
      continue;
    }
  }

  const lpTokens = Object.keys(scriptTotal);
  if (lpTokens.length !== 1) return [0, undefined];
  const [lpToken] = lpTokens;

  return [
    Object.keys(nonScriptTotal).length ? weighting.userAccounts : 0,
    [nonScriptTotal, lpToken],
  ];
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
