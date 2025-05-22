"use strict";
// type: send_ada
// description: Sent #.## ADA
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
// user.total.length === 1 (currency:ADA,amount:-#.##)
// other.role are Unknown Addresses
// no metadata
const weighting = {
    userAccounts: .80,
    otherAccounts: .15,
    metadata: .05,
};
async function score({ accounts, metadata, network_fee }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(accounts.user),
        calcW2(accounts.other),
        calcW3(metadata),
    ]);
    const [, amount] = weights[0];
    const description = `Sent ${amount - network_fee.amount} ADA`;
    const type = "send_ada";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There may be more than 1 associated addresses, but the aggregate currency should only be ADA.
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
    const currencies = Object.keys(assets);
    if (!currencies.length || assets.ADA > 0)
        return [0, assets.ADA];
    const adaCount = currencies.filter((currency) => currency === "ADA").length;
    return [weighting.userAccounts * adaCount / currencies.length, -assets.ADA];
}
/**
 * Unknown Address count / other accounts length, if there's no other account then score:0
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other) {
    if (!other.length)
        return [0, undefined];
    const nonScriptAddressCount = other.filter(({ role }) => role === "Unknown Address").length;
    return [weighting.otherAccounts * nonScriptAddressCount / other.length, undefined];
}
/**
 * The sender can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    return [metadata.length ? 0 : weighting.metadata, undefined];
}
