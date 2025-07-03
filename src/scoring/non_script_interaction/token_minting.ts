// type: token_minting
// description: Token {minted #.## TokenA | and burned #.## TokenB}

import { Account, Transaction } from "../../types/manifest";
import { AddressDetails } from "@lucid-evolution/lucid";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../util/blockfrost";
import { bf, util } from "../../util/_";
import { CalculatedScore, TransactionScore } from "../../types/_";

// imbalance token qty, ignoring ADA
const weighting = {
  tokenMinting: 1.00,
};

export async function score(
  { accounts }: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
): Promise<TransactionScore> {
  const weights = await Promise.all([
    calcTokenMintingWeight(accounts.user, txUTXOs),
  ]);

  const [, totalTokens] = weights[0];

  const mintedTokens = Object.keys(totalTokens)
    .map(
      (currency) => {
        const qty = totalTokens[currency];
        const absQty = Math.abs(qty);
        return `${qty < 0 ?
          "burned" :
          "minted"} ${util
            .formatAmount(
              absQty,
              currency,
            )}`;
      }
    );

  const description = `Token ${mintedTokens.length
    ? util.joinWords(mintedTokens)
    : "Minting/Burning"}`;
  const type = "token_minting";

  const score = util.sumWeights(weights);

  return { type, description, score };
}

/**
 * Imbalance token quantity ignoring ADA.
 * @param user The user accounts
 * @param txUTXOs Blockfrost TransactionUTXOs
 * @returns [Score, AdditionalData]
 */
async function calcTokenMintingWeight(
  user: Account[],
  txUTXOs: TransactionUTXOs,
): Promise<
  CalculatedScore<Record<string, number>>
> {
  const inputAssets = txUTXOs.inputs.reduce(
    (sum, input) => {
      input.amount.reduce(
        (sum: Record<string, bigint>, asset: { unit: string; quantity: string; }) => {
          if (asset.unit !== "lovelace")
            sum[asset.unit] = (sum[asset.unit] ?? 0n) - BigInt(asset.quantity);
          return sum;
        },
        sum,
      );
      return sum;
    },
    {} as Record<string, bigint>,
  );

  const totalAssets = txUTXOs.outputs.reduce(
    (sum, input) => {
      input.amount.reduce(
        (sum: Record<string, bigint>, asset: { unit: string; quantity: string; }) => {
          if (asset.unit !== "lovelace")
            sum[asset.unit] = (sum[asset.unit] ?? 0n) + BigInt(asset.quantity);
          return sum;
        },
        sum,
      );
      return sum;
    },
    inputAssets,
  );

  const totalMintedAssets: Record<string, number> = {};
  for (const unit of Object.keys(totalAssets)) {
    const amount = totalAssets[unit];
    if (amount === 0n) continue; // skip no movement
    const { metadata, onchain_metadata, fingerprint } = await bf.getAssetInfo(unit);
    const currency =
      metadata?.name ?? onchain_metadata?.name ?? fingerprint ?? unit;
    const decimals =
      metadata?.decimals ?? 0;
    totalMintedAssets[currency] = util.convertAmountToNumber(amount, decimals);
  }

  const userMintedAssets = user.reduce(
    (sum, { total }) => {
      total.reduce(
        (sum, { currency, amount }) => {
          if (currency !== "ADA" && totalMintedAssets[currency])
            sum[currency] = (sum[currency] ?? 0) + amount;
          return sum;
        },
        sum,
      );
      return sum;
    },
    {} as Record<string, number>,
  );

  return [
    Object.keys(userMintedAssets).length ? weighting.tokenMinting : 0,
    userMintedAssets,
  ];
}
