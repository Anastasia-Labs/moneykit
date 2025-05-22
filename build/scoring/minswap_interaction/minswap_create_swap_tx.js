"use strict";
// type: PASSTHROUGH | amm_dex
// description: Created a swap transaction on Minswap
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user script address with positive amounts and non-script address with negative amounts
// metadata { label:"674", json_metadata:{ msg:"Minswap: Market Order" } }
const weighting = {
    userAccounts: .75,
    metadata: .25,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.user),
        calcW2(intermediaryTx.metadata),
    ]);
    const description = "Created a swap transaction on Minswap";
    const type = intermediaryTx.type === `${undefined}` ? "amm_dex" : intermediaryTx.type;
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There must be a user script address with positive NonLP amounts,
 * and a non-script address with negative NonLP amounts.
 *
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user) {
    const scriptTotal = {};
    const nonScriptTotal = {};
    for (const account of user) {
        try {
            const { paymentCredential, stakeCredential } = await _1.lucid.getAddressDetails(account.address);
            if (paymentCredential?.type === "Script" || stakeCredential?.type === "Script") {
                for (const { currency, amount } of account.total) {
                    const maybeLP = currency.endsWith(" LP");
                    if (maybeLP || amount < 0)
                        continue; // skip LP Tokens or negative amounts
                    scriptTotal[currency] = (scriptTotal[currency] ?? 0) + amount;
                }
            }
            else {
                for (const { currency, amount } of account.total) {
                    const maybeLP = currency.endsWith(" LP");
                    if (maybeLP || amount > 0)
                        continue; // skip LP Tokens or positive amounts
                    nonScriptTotal[currency] = (nonScriptTotal[currency] ?? 0) + amount;
                }
            }
        }
        catch {
            continue;
        }
    }
    return [Object.keys(scriptTotal).length && Object.keys(nonScriptTotal).length ? weighting.userAccounts : 0, undefined];
}
/**
 * There should be metadata with msg:"Minswap: Market Order"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW2(metadata) {
    // if (!metadata.length) return [0, undefined];
    // const minswapMarketOrderCount = metadata.filter(
    //   ({ label, json_metadata }) => {
    //     const message = json_metadata?.msg;
    //     return label === "674" && message && message.length && message[0] === "Minswap: Market Order";
    //   }
    // ).length;
    // return [weighting.metadata * minswapMarketOrderCount / metadata.length, undefined];
    return [_1.util.weighMetadataMsg("674", "Minswap Market Order".split(" "), metadata) * weighting.metadata, undefined];
}
