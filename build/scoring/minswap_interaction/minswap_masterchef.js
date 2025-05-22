"use strict";
// type: PASSTHROUGH | amm_dex
// description: Received {#.## TokenA | and #.## TokenB} from Minswap
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user accounts to construct the received tokens
// metadata { label:"674", json_metadata:{ msg:"Minswap: MasterChef" } }
const weighting = {
    userAccounts: .10,
    metadata: .90,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.user),
        calcW2(intermediaryTx.metadata),
    ]);
    const [, userTokens] = weights[0];
    const receivedTokens = Object.keys(userTokens)
        .map((currency) => _1.util.formatAmount(userTokens[currency], currency));
    const description = `Received ${_1.util.joinWords(receivedTokens)} from Minswap`;
    const type = intermediaryTx.type === `${undefined}` ? "amm_dex" : intermediaryTx.type;
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * Just to provide the received tokens.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user) {
    const assets = user.reduce((sum, { total }) => {
        total.reduce((sum, { currency, amount }) => {
            sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
        }, sum);
        return sum;
    }, {});
    return [Object.keys(assets).length ? weighting.userAccounts : 0, assets];
}
/**
 * There should be metadata with msg:"Minswap: MasterChef"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW2(metadata) {
    // if (!metadata.length) return [0, undefined];
    // let score = 0;
    // const minswap = "Minswap";
    // const masterchef = "MasterChef";
    // for (const { label, json_metadata } of metadata) {
    //   try {
    //     if (label === "674") {
    //       for (const message of json_metadata?.msg) {
    //         if (message.startsWith(minswap)) {
    //           score += 10;
    //         } else if (message.toLowerCase().startsWith(minswap.toLowerCase())) {
    //           score += 5;
    //         } else if (message.includes(minswap)) {
    //           score += 2;
    //         } else if (message.toLowerCase().includes(minswap.toLowerCase())) {
    //           score += 1;
    //         }
    //         if (message.endsWith(masterchef)) {
    //           score += 10;
    //         } else if (message.toLowerCase().endsWith(masterchef.toLowerCase())) {
    //           score += 5;
    //         } else if (message.includes(masterchef)) {
    //           score += 2;
    //         } else if (message.toLowerCase().includes(masterchef.toLowerCase())) {
    //           score += 1;
    //         }
    //         if (score) break;
    //       }
    //     }
    //   } catch {
    //     continue;
    //   }
    // }
    // return [weighting.metadata * score / 20, undefined];
    return [_1.util.weighMetadataMsg("674", "Minswap MasterChef".split(" "), metadata) * weighting.metadata, undefined];
}
