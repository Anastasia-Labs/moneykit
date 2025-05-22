"use strict";
// type: PASSTHROUGH | amm_dex
// description: Unstaked #.## MIN from Minswap
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user.total with positive Minswap
// other.role there's a Minswap Min staking... with negative Minswap
// metadata { label:"674", json_metadata:{ msg:"Minswap: Unstake MIN" } }
const weighting = {
    userAccounts: .40,
    otherAccounts: .10,
    metadata: .50,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.user),
        calcW2(intermediaryTx.accounts.other),
        calcW3(intermediaryTx.metadata),
    ]);
    const [, minswap] = weights[0];
    const description = minswap > 0
        ? `Unstaked ${minswap} MIN from Minswap`
        : "Unstaked MIN from Minswap";
    const type = intermediaryTx.type === `${undefined}` ? "amm_dex" : intermediaryTx.type;
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There should be a positive Minswap.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user) {
    const minswap = user.reduce((sum, { total }) => total.reduce((sum, { currency, amount }) => {
        if (currency === "Minswap")
            sum += amount;
        return sum;
    }, sum), 0);
    return [minswap > 0 ? weighting.userAccounts : 0, minswap];
}
/**
 * There should be a Minswap Min staking... with negative Minswap.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other) {
    return [other.find(({ role, total }) => role.toUpperCase().startsWith("MINSWAP MIN STAKING") && total.find(({ currency, amount }) => currency === "Minswap" && amount < 0)) ? weighting.otherAccounts : 0, undefined];
}
/**
 * There should be metadata with msg:"Minswap: Unstake MIN"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    // if (!metadata.length) return [0, undefined];
    // let score = 0;
    // const minswap = "Minswap";
    // const unstake = "Unstake";
    // const min = "MIN";
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
    //         if (message.includes(unstake)) {
    //           score += 2;
    //         } else if (message.toLowerCase().includes(unstake.toLowerCase())) {
    //           score += 1;
    //         }
    //         if (message.includes(min)) {
    //           score += 2;
    //         } else if (message.toUpperCase().includes(min)) {
    //           score += 1;
    //         }
    //         if (score) break;
    //       }
    //     }
    //   } catch {
    //     continue;
    //   }
    // }
    // return [weighting.metadata * score / 14, undefined];
    return [_1.util.weighMetadataMsg("674", "Minswap Unstake MIN".split(" "), metadata) * weighting.metadata, undefined];
}
