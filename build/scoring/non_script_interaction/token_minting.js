"use strict";
// type: token_minting
// description: Token {minted #.## TokenA | and burned #.## TokenB}
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// imbalance token qty, ignoring ADA
const weighting = {
    tokenMinting: 1.00,
};
async function score({ accounts }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(accounts.user, txUTXOs),
    ]);
    const [, totalTokens] = weights[0];
    const mintedTokens = Object.keys(totalTokens)
        .map((currency) => {
        const qty = totalTokens[currency];
        const absQty = Math.abs(qty);
        return `${qty < 0 ? "burned" : "minted"} ${_1.util.formatAmount(absQty, currency)}`;
    });
    const description = `Token ${mintedTokens.length ? _1.util.joinWords(mintedTokens) : "Minting/Burning"}`;
    const type = "token_minting";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * Imbalance token quantity ignoring ADA.
 * @param user The user accounts
 * @param txUTXOs Blockfrost TransactionUTXOs
 * @returns [Score, AdditionalData]
 */
async function calcW1(user, txUTXOs) {
    const inputAssets = txUTXOs.inputs.reduce((sum, input) => {
        input.amount.reduce((sum, asset) => {
            if (asset.unit !== "lovelace")
                sum[asset.unit] = (sum[asset.unit] ?? 0n) - BigInt(asset.quantity);
            return sum;
        }, sum);
        return sum;
    }, {});
    const totalAssets = txUTXOs.outputs.reduce((sum, input) => {
        input.amount.reduce((sum, asset) => {
            if (asset.unit !== "lovelace")
                sum[asset.unit] = (sum[asset.unit] ?? 0n) + BigInt(asset.quantity);
            return sum;
        }, sum);
        return sum;
    }, inputAssets);
    const totalMintedAssets = {};
    for (const unit of Object.keys(totalAssets)) {
        const amount = totalAssets[unit];
        if (amount === 0n)
            continue; // skip no movement
        const { metadata, onchain_metadata, fingerprint } = await _1.bf.getAssetInfo(unit);
        const currency = metadata?.name ?? onchain_metadata?.name ?? fingerprint ?? unit;
        const decimals = metadata?.decimals ?? 0;
        const t = BigInt(10 ** decimals);
        const a = amount / t;
        const b = (amount < 0n ? -amount : amount) % t;
        totalMintedAssets[currency] = parseFloat(`${a ? a : amount < 0n ? "-0" : "0"}.${`${b}`.padStart(decimals, "0")}`);
    }
    const userMintedAssets = user.reduce((sum, { total }) => {
        total.reduce((sum, { currency, amount }) => {
            if (currency !== "ADA" && totalMintedAssets[currency])
                sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
        }, sum);
        return sum;
    }, {});
    return [Object.keys(userMintedAssets).length ? weighting.tokenMinting : 0, userMintedAssets];
}
