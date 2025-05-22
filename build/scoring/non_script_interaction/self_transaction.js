"use strict";
// type: self_transaction
// description: Self Transaction
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
// user.total.length
// other.role.length === 0
const weighting = {
    userAccounts: .50,
    otherAccounts: .50,
};
async function score({ accounts }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(accounts.user),
        calcW2(accounts.other),
    ]);
    const description = "Self Transaction";
    const type = "self_transaction";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * Has at least a user account.
 * @param user User Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(user) {
    return [user.length ? weighting.userAccounts : 0, undefined];
}
/**
 * Has no other accounts.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other) {
    return [other.length ? 0 : weighting.otherAccounts, undefined];
}
