// type: PASSTHROUGH | amm_dex
// description: Withdrew #.## XXX-YYY LP Tokens from Wingriders

import { Account, Asset, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// other.role there's a Wingriders Farm... with negative amount(s) LPtokens
// no withdrawal if ran through Wingriders UI
// no metadata if ran through Wingriders UI
const weighting = {
  otherAccounts: .80,
  withdrawal: .10,
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
    calcOtherAccountsWeight(intermediaryTx.accounts.other),
    calcWithdrawalWeight(intermediaryTx.withdrawal_amount),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, lpTokens] = weights[0];

  const description = lpTokens?.length
    ? `Withdrew ${util.joinWords(lpTokens)} LP Tokens from Wingriders`
    : "Withdrew LP Tokens from Wingriders";
  const type = lpTokens?.length ? "amm_dex" : intermediaryTx.type;

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There should be a Wingriders Farm... with negative amount(s) LPtokens.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<
  CalculatedScore<string[]>
> {
  if (!other.length) return [0, []];

  const assets = other.reduce(
    (sum, { total }) => {
      total.reduce(
        (sum, { currency, amount }) => {
          sum[currency] = (sum[currency] ?? 0) - amount;
          return sum;
        },
        sum,
      );
      return sum;
    },
    {} as Record<string, number>,
  );

  const currencies = Object.keys(assets);
  const lpTokens = currencies.filter(
    (currency) =>
      assets[currency] > 0 && currency.startsWith("WR-LPT")
  ).map(
    (currency) =>
      `${util.formatAmount(
        assets[currency],
        currency
          .replace("WR-LPT-", "")
          .replaceAll("/", "-"),
      )}`
  );

  return [weighting.otherAccounts * other.filter(
    ({ role, total }) =>
      role.startsWith("Wingriders") && total.find(
        ({ currency }) =>
          currency.includes("-LPT-")
      )
  ).length / other.length, lpTokens];
}

/**
 * No withdrawal if ran through Wingriders UI
 * @param withdrawal Whether there's some withdrawal associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcWithdrawalWeight(withdrawal?: Asset): Promise<
  CalculatedScore<undefined>
> {
  return [withdrawal ? 0 : weighting.withdrawal, undefined];
}

/**
 * There should be no metadata if ran through the Wingriders UI
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [metadata.length ? 0 : weighting.metadata, undefined];
}
