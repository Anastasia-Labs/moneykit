"use strict";
// type: yield_farming | PASSTHROUGH
// description: Withdrew {LP Tokens | liquidity} from Minswap
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user.total with positive LP Tokens
// other.role there's a Minswap Yield Farming... with negative LP Tokens
// metadata { label:"674", json_metadata:{ msg:"Minswap: ... Withdraw liquidity" } }
const weighting = {
    userAccounts: .10,
    otherAccounts: .40,
    metadata: .50,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.user),
        calcW2(intermediaryTx.accounts.other),
        calcW3(intermediaryTx.metadata),
    ]);
    const [, userTokens] = weights[0];
    const [, yieldFarming] = weights[1];
    const lpTokens = !userTokens ? undefined : Object.keys(userTokens)
        .map((currency) => _1.util.formatAmount(userTokens[currency], currency));
    const description = `Withdrew ${lpTokens ? _1.util.joinWords(lpTokens) : "liquidity"} from Minswap`;
    const type = yieldFarming ? "yield_farming" : intermediaryTx.type;
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There should be positive LP Tokens.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user) {
    const lpTokens = user.reduce((sum, { total }) => {
        total.reduce((sum, { currency, amount }) => {
            if ((currency.endsWith(" LP") || (currency.startsWith("asset") && currency.length === 44)) && amount > 0)
                sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
        }, sum);
        return sum;
    }, {});
    return [Object.keys(lpTokens).length ? weighting.userAccounts : 0, lpTokens];
}
/**
 * There should be a Minswap Yield Farming... with negative LP Tokens,
 * if there's no other account then score:0
 *
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other) {
    if (!other.length)
        return [0, undefined];
    const yieldFarming = other.find(({ role, total }) => role.startsWith("Minswap Yield Farming") && total.find(({ currency, amount }) => (currency.endsWith(" LP") || (currency.startsWith("asset") && currency.length === 44)) && amount < 0));
    return [yieldFarming ? weighting.otherAccounts : 0, yieldFarming];
}
/**
 * There should be metadata with msg:"Minswap: ... Withdraw liquidity"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    // if (!metadata.length) return [0, undefined];
    // let score = 0;
    // const minswap = "Minswap";
    // const withdraw = "Withdraw";
    // const liquidity = "liquidity";
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
    //         if (message.includes(withdraw)) {
    //           score += 10;
    //         } else if (message.toLowerCase().includes(withdraw.toLowerCase())) {
    //           score += 1;
    //         }
    //         if (message.endsWith(liquidity)) {
    //           score += 10;
    //         } else if (message.includes(liquidity)) {
    //           score += 2;
    //         }
    //         if (score) break;
    //       }
    //     }
    //   } catch {
    //     continue;
    //   }
    // }
    // return [weighting.metadata * score / 30, undefined];
    return [_1.util.weighMetadataMsg("674", "Minswap Withdraw liquidity".split(" "), metadata) * weighting.metadata, undefined];
}
