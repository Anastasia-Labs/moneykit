"use strict";
// type: receive_tokens
// description: Received #.## TokenA, #.## TokenB and #.## TokenC
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user.total with positive amounts
// other.role are Unknown Addresses
// no withdrawal
// no metadata
const weighting = {
    userAccounts: .40,
    otherAccounts: .30,
    withdrawal: .20,
    metadata: .10,
};
async function score({ accounts, metadata, withdrawal_amount, network_fee }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(accounts.user),
        calcW2(accounts.other),
        calcW3(withdrawal_amount),
        calcW4(metadata),
    ]);
    const totalTokens = {
    // [network_fee.currency]: network_fee.amount,
    };
    const [, inputTokens] = weights[0];
    // const [, outputTokens] = weights[1];
    Object.keys(inputTokens).forEach((currency) => {
        if (currency !== "ADA")
            totalTokens[currency] = (totalTokens[currency] ?? 0) + inputTokens[currency];
    });
    // Object.keys(outputTokens).forEach(
    //   (currency) => {
    //     if (currency === "ADA")
    //       totalTokens[currency] = (totalTokens[currency] ?? 0) + outputTokens[currency];
    //   });
    const receiveTokens = Object.keys(totalTokens)
        .filter((currency) => totalTokens[currency] > 0)
        .map((currency) => _1.util.formatAmount(totalTokens[currency], currency));
    const description = `Received ${_1.util.joinWords(receiveTokens)}`.trim();
    const type = "receive_tokens";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * Input amounts should be positive.
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
    const amounts = Object.values(assets);
    if (!amounts.length)
        return [0, assets];
    const negativesCount = amounts.filter((amount) => amount > 0).length;
    return [amounts.length > 1 // to differentiate with receive_ada
            ? weighting.userAccounts * negativesCount / amounts.length
            : 0, assets];
}
/**
 * Output amounts should be negative.
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
    // filter out ADA to differentiate with receive_ada
    const currencies = Object.keys(assets).filter((currency) => currency !== "ADA" && assets[currency]);
    if (!currencies.length)
        return [0, assets];
    const negativesCount = currencies.filter((currency) => assets[currency] < 0).length;
    return [weighting.otherAccounts * negativesCount / currencies.length, assets];
}
/**
 * It is impossible to withdraw as a beneficiary, the sender may withdraw their stake rewards but not the receivers.
 * @param withdrawal Whether is there some withdrawals associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcW3(withdrawal) {
    return [withdrawal ? 0 : weighting.withdrawal, undefined];
}
/**
 * The sender can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW4(metadata) {
    return [metadata.length ? 0 : weighting.metadata, undefined];
}
