"use strict";
// type: PASSTHROUGH | amm_dex
// description: Withdrew #.## XXX-YYY LP Tokens from Wingriders
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// other.role there's a Wingriders Farm... with negative amount(s) LPtokens
// no withdrawal if ran through Wingriders UI
// no metadata if ran through Wingriders UI
const weighting = {
    otherAccounts: .80,
    withdrawal: .10,
    metadata: .10,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.other),
        calcW2(intermediaryTx.withdrawal_amount),
        calcW3(intermediaryTx.metadata),
    ]);
    const [, lpTokens] = weights[0];
    const description = lpTokens?.length
        ? `Withdrew ${_1.util.joinWords(lpTokens)} LP Tokens from Wingriders`
        : "Withdrew LP Tokens from Wingriders";
    const type = lpTokens?.length ? "amm_dex" : intermediaryTx.type;
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There should be a Wingriders Farm... with negative amount(s) LPtokens.
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(other) {
    const assets = other.reduce((sum, { total }) => {
        total.reduce((sum, { currency, amount }) => {
            sum[currency] = (sum[currency] ?? 0) - amount;
            return sum;
        }, sum);
        return sum;
    }, {});
    const currencies = Object.keys(assets);
    const lpTokens = currencies.filter((currency) => assets[currency] > 0 && currency.startsWith("WR-LPT")).map((currency) => `${assets[currency]} ${currency
        .replace("WR-LPT-", "")
        .replaceAll("/", "-")}`);
    return [weighting.otherAccounts * other.filter(({ role, total }) => role.startsWith("Wingriders") && total.find(({ currency }) => currency.includes("-LPT-"))).length / other.length, lpTokens];
}
/**
 * No withdrawal if ran through Wingriders UI
 * @param withdrawal Whether is there some withdrawals associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcW2(withdrawal) {
    return [withdrawal ? 0 : weighting.withdrawal, undefined];
}
/**
 * There should be no metadata if ran through the Wingriders UI
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    return [metadata.length ? 0 : weighting.metadata, undefined];
}
