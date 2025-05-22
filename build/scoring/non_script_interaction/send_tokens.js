"use strict";
// type: send_tokens
// description: Sent #.## TokenA, #.## TokenB and #.## TokenC
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user.total with negative amounts
// other.role are Unknown Addresses
// no metadata
const weighting = {
    userAccounts: .50,
    otherAccounts: .40,
    metadata: .10,
};
async function score({ accounts, metadata, network_fee }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(accounts.user),
        calcW2(accounts.other),
        calcW3(metadata),
    ]);
    const totalTokens = {
    // [network_fee.currency]: network_fee.amount,
    };
    const [, inputTokens] = weights[0];
    // const [, outputTokens] = weights[1];
    Object.keys(inputTokens).forEach((currency) => {
        // if (currency === "ADA")
        //   totalTokens[currency] = (totalTokens[currency] ?? 0) + inputTokens[currency];
        // else
        //   totalTokens[currency] = (totalTokens[currency] ?? 0) - inputTokens[currency];
        if (currency !== "ADA")
            totalTokens[currency] = (totalTokens[currency] ?? 0) - inputTokens[currency];
    });
    // Object.keys(outputTokens).forEach(
    //   (currency) => {
    //     if (currency === "ADA")
    //       totalTokens[currency] = (totalTokens[currency] ?? 0) + outputTokens[currency];
    //   });
    const sendTokens = Object.keys(totalTokens)
        .filter((currency) => totalTokens[currency] > 0)
        .map((currency) => _1.util.formatAmount(totalTokens[currency], currency));
    const description = `Sent ${_1.util.joinWords(sendTokens)}`.trim();
    const type = "send_tokens";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * Input amounts should be negative.
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
    // filter out ADA to differentiate with send_ada
    const currencies = Object.keys(assets).filter((currency) => currency !== "ADA" && assets[currency]);
    if (!currencies.length)
        return [0, assets];
    const negativesCount = currencies.filter((currency) => assets[currency] < 0).length;
    return [weighting.userAccounts * negativesCount / currencies.length, assets];
}
/**
 * Output amounts should be positive.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other) {
    const assets = other.reduce((sum, { total }) => {
        total.reduce((sum, { currency, amount }) => {
            sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
        }, sum);
        return sum;
    }, {});
    const amounts = Object.values(assets);
    if (!amounts.length)
        return [0, assets];
    const positivesCount = amounts.filter((amount) => amount > 0).length;
    return [amounts.length > 1 // to differentiate with send_ada
            ? weighting.otherAccounts * positivesCount / amounts.length
            : 0, assets];
}
/**
 * The user can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    return [metadata.length ? 0 : weighting.metadata, undefined];
}
