// type: yield_farming | PASSTHROUGH
// description: Withdrew {LP Tokens | liquidity} from Minswap

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total with positive LP Tokens
// other.role there's a Minswap Yield Farming... with negative LP Tokens
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
    calcW1(intermediaryTx.accounts.user),
    calcW2(intermediaryTx.accounts.other),
    calcW3(intermediaryTx.metadata),
  ]);

  const [, userTokens] = weights[0];
  const [, yieldFarming] = weights[1];

  const lpTokens = Object.keys(userTokens)
    .map(
      (currency) =>
        util.formatAmount(userTokens[currency], currency),
    );

  const description = `Withdrew ${lpTokens.length
    ? util.joinWords(lpTokens)
    : "liquidity"} from Minswap`;
  const type = yieldFarming ? "yield_farming" : intermediaryTx.type;

  const score = parseFloat(
    weights.reduce(
      (sum, [weight]) => sum + weight,
      0,
    ).toFixed(2),
  );

  return { type, description, score };
}

/**
 * There should be positive LP Tokens.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user: Account[]): Promise<
  CalculatedScore<Record<string, number>>
> {
  const lpTokens = user.reduce(
    (sum, { total }) => {
      total.reduce(
        (sum, { currency, amount }) => {
          if (
            amount > 0 && (
              currency.endsWith(" LP") ||
              (currency.startsWith("asset") && currency.length === 44)
            )
          ) sum[currency] = (sum[currency] ?? 0) + amount;
          return sum;
        },
        sum,
      );
      return sum;
    },
    {} as Record<string, number>,
  );
  return [Object.keys(lpTokens).length ? weighting.userAccounts : 0, lpTokens];
}

/**
 * There should be a Minswap Yield Farming... with negative LP Tokens,
 * if there's no other account then score:0
 * 
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other: Account[]): Promise<
  CalculatedScore<Account | undefined>
> {
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
  return [yieldFarming ? weighting.otherAccounts : 0, yieldFarming];
}

/**
 * There should be metadata with msg:"Minswap: ... Withdraw liquidity"
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
        "Minswap Withdraw liquidity".split(" "),
        metadata,
      ),
    undefined,
  ];
}
