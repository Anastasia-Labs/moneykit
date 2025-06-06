// type: PASSTHROUGH | amm_dex
// description: Created a liquidity removal order (withdraw XXX-YYY) on Wingriders

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total with ADA and negative LPT
// other.role is a Wingriders Addr with ADA and positive LPT
// metadata { label:"674", json_metadata:{ msg:"WingRiders: ... Liquidity" } }
const weighting = {
  userAccounts: .40,
  otherAccounts: .50,
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
    calcW1(intermediaryTx.accounts.user),
    calcW2(intermediaryTx.accounts.other),
    calcW3(intermediaryTx.metadata),
  ]);

  const [, pairTokens] = weights[0];

  const description = pairTokens
    ? `Created a liquidity removal order (withdraw ${pairTokens}) on Wingriders`
    : "Created a liquidity removal order on Wingriders";
  const type = intermediaryTx.type === `${undefined}`
    ? "amm_dex"
    : intermediaryTx.type;

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * The user must pay ADA and negative LP
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user: Account[]): Promise<
  CalculatedScore<string | undefined>
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
  if (!currencies.length) return [0, undefined];

  const pairCount = currencies.filter(
    (currency) =>
      // LPT must be negative:
      (currency.includes("-LPT-") && assets[currency] < 0)
      || currency === "ADA"
  ).length;

  const pairTokens = currencies.find(
    (currency) => {
      // find negative WR-LPT:
      return currency.startsWith("WR-LPT") && assets[currency] < 0;
    });

  return [
    weighting.userAccounts * pairCount / currencies.length,
    pairTokens?.replace("WR-LPT-", "")
      .replaceAll("/", "-"),
  ];
}

/**
 * Wingriders address with ADA and positive LPT,
 * divided by other accounts length.
 * 
 * If there's no other account then score:0
 * 
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other: Account[]): Promise<
  CalculatedScore<undefined>
> {
  if (!other.length) return [0, undefined];

  let depositLptAddressCount = 0;
  for (const { role, total } of other) {
    const wingridersScriptAddress =
      role.startsWith("Wingriders")
      && total.length === 2
      && total.every(
        ({ currency, amount }) =>
          (currency.startsWith("WR-LPT") || currency === "ADA") &&
          amount > 0
      );
    if (wingridersScriptAddress) depositLptAddressCount += 1;
  }
  return [
    weighting.otherAccounts * depositLptAddressCount / other.length,
    undefined,
  ];
}

/**
 * There could be metadata with msg:"WingRiders: ... Liquidity"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [
    weighting.metadata * util
      .weighMetadataMsg(
        "674",
        "WingRiders liquidity".split(" "),
        metadata,
      ),
    undefined,
  ];
}
