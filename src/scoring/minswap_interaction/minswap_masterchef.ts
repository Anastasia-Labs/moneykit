// type: PASSTHROUGH | amm_dex
// description: Received {#.## TokenA | and #.## TokenB} from Minswap

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { CalculatedScore, TransactionScore } from "../../types/_";
import { util } from "../../util/_";

// user accounts to construct the received tokens
// metadata { label:"674", json_metadata:{ msg:"Minswap: MasterChef" } }
const weighting = {
  userAccounts: .25,
  metadata: .75,
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
    calcMetadataWeight(intermediaryTx.metadata),
  ]);

  const [, userTokens] = weights[0];

  const receivedTokens = Object.keys(userTokens)
    .map(
      (currency) =>
        util.formatAmount(userTokens[currency], currency),
    );

  if (receivedTokens.length) {
    const description = `Received ${util.joinWords(receivedTokens)} from Minswap`;
    const type = intermediaryTx.type === `${undefined}`
      ? "amm_dex"
      : intermediaryTx.type;

    const score = util.sumWeights(weights);

    return { type, description, score };
  } else {
    return {
      type: intermediaryTx.type,
      description: intermediaryTx.description,
      score: 0,
    };
  };
}

/**
 * Just to provide the received tokens.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcUserAccountsWeight(user: Account[]): Promise<
  CalculatedScore<Record<string, number>>
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
  return [Object.keys(assets).length ? weighting.userAccounts : 0, assets];
}

/**
 * There should be metadata with msg:"Minswap: MasterChef"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcMetadataWeight(metadata: Record<string, any>[]): Promise<
  CalculatedScore<undefined>
> {
  return [
    weighting.metadata * util.weighMetadataMsg(
      "674",
      "Minswap MasterChef".split(" "),
      metadata,
    ),
    undefined,
  ];
}
