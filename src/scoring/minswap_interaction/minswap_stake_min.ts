// type: PASSTHROUGH | amm_dex
// description: Staked #.## MIN on Minswap

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user.total with negative Minswap
// other.role there's a Minswap Min staking... with positive Minswap
// metadata { label:"674", json_metadata:{ msg:"Minswap: Stake MIN" } }
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
    calcOtherAccountsWeight(intermediaryTx.accounts.other),
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, minswap] = weights[0];

  const description = minswap > 0
    ? `Staked ${util.formatAmount(minswap, "MIN")} on Minswap`
    : `Staked MIN on Minswap`;
  const type = intermediaryTx.type === `${undefined}`
    ? "amm_dex"
    : intermediaryTx.type;

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * There should be a negative Minswap.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<CalculatedScore<number>> {
  const minswap = user.reduce(
    (sum, { total }) =>
      total.reduce(
        (sum, { currency, amount }) => {
          if (currency === "Minswap")
            sum -= amount;
          return sum;
        },
        sum,
      ),
    0,
  );
  return [minswap > 0 ? weighting.userAccounts : 0, minswap];
}

/**
 * There should be a script or Minswap Min staking... with positive Minswap.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcOtherAccountsWeight(other: Account[]): Promise<CalculatedScore<undefined>> {
  return [
    other.find(
      ({ role, total }) =>
        (
          role === "Unknown Script" ||
          role.toUpperCase().startsWith("MINSWAP MIN STAKING")
        ) && total.find(
          ({ currency, amount }) =>
            currency === "Minswap" && amount > 0
        )
    ) ? weighting.otherAccounts : 0,
    undefined,
  ];
}

/**
 * There should be metadata with msg:"Minswap: Stake MIN"
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
        "Minswap Stake MIN".split(" "),
        metadata,
      ),
    undefined,
  ];
}
