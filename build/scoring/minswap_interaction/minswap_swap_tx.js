"use strict";
// type: PASSTHROUGH | amm_dex
// description: Swapped #.## TokenA for #.## TokenB on Minswap
// NOTE: Right now, this will only work properly with swap ADA for #.## Tokens
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// user script address with negative amounts and non-script address with positive amounts
// no withdrawal
// metadata { label:"674", json_metadata:{ msg:"Minswap: Order Executed" } }
const weighting = {
    userAccounts: .60,
    withdrawal: .30,
    metadata: .10,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.user, txUTXOs),
        calcW2(intermediaryTx.withdrawal_amount),
        calcW3(intermediaryTx.metadata),
    ]);
    const [, paidLovelaceforTokens] = weights[0];
    if (paidLovelaceforTokens?.length === 2) {
        const [paidLovelace, forTokens] = paidLovelaceforTokens;
        const fromADA = paidLovelace / 1_000000;
        const toTokens = Object.keys(forTokens)
            .filter((currency) => currency !== "ADA")
            .map((currency) => _1.util.formatAmount(forTokens[currency], currency));
        const description = `Swapped ${fromADA} ADA for ${_1.util.joinWords(toTokens)} on Minswap`;
        const type = intermediaryTx.type === `${undefined}` ? "amm_dex" : intermediaryTx.type;
        const score = weights.reduce((sum, [weight]) => sum + weight, 0);
        return { type, description, score };
    }
    else {
        return {
            type: intermediaryTx.type,
            description: intermediaryTx.description,
            score: 0,
        };
    }
}
/**
 * There must be a user script address with negative NonLP amounts,
 * and a non-script address with positive NonLP amounts.
 *
 * @param user User Accounts
 * @param txUTXOs Blockfrost TransactionUTXOs
 * @returns [Score, AdditionalData]
 */
async function calcW1(user, txUTXOs) {
    try {
        const scriptAddresses = [];
        const scriptTotal = {};
        const nonScriptAddresses = [];
        const nonScriptTotal = {};
        for (const account of user) {
            try {
                const { paymentCredential, stakeCredential } = await _1.lucid.getAddressDetails(account.address);
                if (paymentCredential?.type === "Script" || stakeCredential?.type === "Script") {
                    for (const { currency, amount } of account.total) {
                        const maybeLP = currency.endsWith(" LP");
                        if (maybeLP || amount > 0)
                            continue; // skip LP Tokens or positive amounts
                        scriptTotal[currency] = (scriptTotal[currency] ?? 0) + amount;
                        scriptAddresses.push(account.address);
                    }
                }
                else {
                    for (const { currency, amount } of account.total) {
                        const maybeLP = currency.endsWith(" LP");
                        if (maybeLP || amount < 0)
                            continue; // skip LP Tokens or negative amounts
                        nonScriptTotal[currency] = (nonScriptTotal[currency] ?? 0) + amount;
                        nonScriptAddresses.push(account.address);
                    }
                }
            }
            catch {
                continue;
            }
        }
        if (scriptAddresses.length !== 1)
            return [0, undefined];
        const [scriptAddress] = scriptAddresses;
        const datumHash = txUTXOs.inputs.find(({ address }) => address === scriptAddress)?.data_hash;
        if (!datumHash)
            return [0, undefined];
        const { json_value } = await _1.bf.getDatum(datumHash);
        const paidLovelace = json_value.fields[6].fields[1].fields[0].int;
        return [Object.keys(scriptTotal).length && Object.keys(nonScriptTotal).length ? weighting.userAccounts : 0, [paidLovelace, nonScriptTotal]];
    }
    catch {
        return [0, undefined];
    }
}
/**
 * The user will never withdraw as a the transaction is executed by some batchers.
 * @param withdrawal Whether is there some withdrawals associated with the user address
 * @returns [Score, AdditionalData]
 */
async function calcW2(withdrawal) {
    return [withdrawal ? 0 : weighting.withdrawal, undefined];
}
/**
 * There should be metadata with msg:"Minswap: Order Executed"
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    // if (!metadata.length) return [0, undefined];
    // const minswapOrderExecutedCount = metadata.filter(
    //   ({ label, json_metadata }) => {
    //     const message = json_metadata?.msg;
    //     return label === "674" && message && message.length && message[0] === "Minswap: Order Executed";
    //   }
    // ).length;
    // return [weighting.metadata * minswapOrderExecutedCount / metadata.length, undefined];
    return [_1.util.weighMetadataMsg("674", "Minswap Order Executed".split(" "), metadata) * weighting.metadata, undefined];
}
