"use strict";
// type: stake_registration
// description: Stake Registration
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
// txInfo.stake_cert_count && !txInfo.delegation_count
// user.total.length === 1 (currency:ADA,amount:-#.##)
// other.role.length === 0
// no withdrawal
// no metadata
const weighting = {
    stakeRegistration: .25,
    userAccounts: .20,
    otherAccounts: .20,
    withdrawal: .25,
    metadata: .10,
};
async function score({ accounts, metadata, withdrawal_amount }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW0(txInfo),
        calcW1(accounts.user),
        calcW2(accounts.other),
        calcW3(withdrawal_amount),
        calcW4(metadata),
    ]);
    const description = "Stake Registration";
    const type = "stake_registration";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * Stake certs count must be greater than 0 and Delegation count must be 0
 * @param txInfo Blockfrost TxInfo
 */
async function calcW0(txInfo) {
    return [txInfo.stake_cert_count && !txInfo.delegation_count ? weighting.stakeRegistration : 0, undefined];
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
        return [0, undefined];
    const adaCount = currencies.filter((currency) => currency === "ADA").length;
    return [weighting.userAccounts * adaCount / currencies.length, undefined];
}
/**
 * Usually no other accounts, unless the address has other associated addresses.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW2(other) {
    return [other.length ? 0 : weighting.otherAccounts, undefined];
}
/**
 * No withdrawal.
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
