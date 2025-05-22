"use strict";
// type: PASSTHROUGH | amm_dex
// description: Executed an order on Minswap
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
const _1 = require("../../util/_");
// other.role there's a Minswap address
// no withdrawal
// metadata { label:"674", json_metadata:{ msg:"Minswap: ..." } }
const weighting = {
    otherAccounts: .50,
    withdrawal: .15,
    metadata: .35,
};
async function score(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(intermediaryTx.accounts.other),
        calcW2(intermediaryTx.withdrawal_amount),
        calcW3(intermediaryTx.metadata),
    ]);
    const description = "Executed an order on Minswap";
    const type = intermediaryTx.type === `${undefined}` ? "amm_dex" : intermediaryTx.type;
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * There should be a NonKeyAddress, if there's no other account then score:0
 * @param other Other Accounts
 * @returns [Score, AdditionalData]
 */
async function calcW1(other) {
    if (!other.length)
        return [0, undefined];
    const hasMinswap = other.find(({ role }) => role.includes("Minswap"));
    if (hasMinswap)
        return [weighting.otherAccounts, undefined];
    const hasScript = other.find(({ role }) => role === "Unknown Script");
    if (hasScript)
        return [weighting.otherAccounts / 2, undefined];
    return [0, undefined];
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
 * There could be metadata with msg:"Minswap: ..."
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW3(metadata) {
    // if (!metadata.length) return [0, undefined];
    // const minswapOrderExecuted = metadata.filter(
    //   ({ label, json_metadata }) => {
    //     return label === "674" && json_metadata?.msg?.find(
    //       (message: string) =>
    //         message.startsWith("Minswap")
    //     );
    //   }
    // );
    // return [weighting.metadata * minswapOrderExecuted.length / metadata.length, undefined];
    return [_1.util.weighMetadataMsg("674", ["Minswap"], metadata) * weighting.metadata, undefined];
}
