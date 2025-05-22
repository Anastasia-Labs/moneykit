"use strict";
// type: setup_collateral
// description: Setup Collateral
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// output 5 ADA to user own account
// user.total == network_fee
// no other.role or all are user own PKH
// no metadata
const weighting = {
    output5ada: .50,
    userAccounts: .20,
    otherAccounts: .20,
    metadata: .10,
};
async function score({ accounts, metadata, network_fee }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW0(txUTXOs, lucidAddressDetails),
        calcW1(accounts.user, network_fee),
        calcW2(accounts.other, lucidAddressDetails),
        calcW3(metadata),
    ]);
    const description = "Setup Collateral";
    const type = "setup_collateral";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There must be an output of 5 ADA to user own account.
 * @param txUTXOs Blockfrost Transaction UTXOs
 * @param lucidAddressDetails Lucid User AddressDetails
 * @returns [Score, AdditionalData]
 */
async function calcW0(txUTXOs, lucidAddressDetails) {
    for (const { address, amount } of txUTXOs.outputs) {
        try {
            const pk = await _1.lucid.paymentCredentialOf(address);
            const sk = await _1.lucid.stakeCredentialOf(address);
            if (pk?.hash !== lucidAddressDetails.paymentCredential?.hash && sk?.hash !== lucidAddressDetails.stakeCredential?.hash)
                continue;
            for (const { unit, quantity } of amount) {
                if (unit === "lovelace" && quantity === "5000000")
                    return [weighting.output5ada, undefined];
            }
        }
        catch {
            continue;
        }
    }
    return [0, undefined];
}
/**
 * Input amounts equals to network fee for single address wallets amd no stake rewards withdrawal.
 * @param user User Accounts
 * @param networkFee Network Fee
 * @returns [Score, AdditionalData]
 */
async function calcW1(user, networkFee) {
    const assets = user.reduce((sum, { total }) => {
        total.reduce((sum, { currency, amount }) => {
            sum[currency] = (sum[currency] ?? 0) + amount;
            return sum;
        }, sum);
        return sum;
    }, {});
    return [assets.ADA + networkFee.amount ? 0 : weighting.userAccounts, undefined];
}
/**
 * All output addresses must be user PKH.
 * @param other Other Accounts
 * @param lucidAddressDetails Lucid User AddressDetails
 * @returns [Score, AdditionalData]
 */
async function calcW2(other, lucidAddressDetails) {
    for (const { address } of other) {
        const pk = await _1.lucid.paymentCredentialOf(address);
        if (pk?.hash !== lucidAddressDetails.paymentCredential?.hash)
            return [0, undefined];
    }
    return [weighting.otherAccounts, undefined];
}
/**
 * The user can optionally put some arbitrary metadata though.
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    return [metadata.length ? 0 : weighting.metadata, undefined];
}
