"use strict";
// type: catalyst_registration
// description: Catalyst Registration
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
// Catalyst registration metadata
const weighting = {
    metadata: 1.00,
};
async function score({ metadata }, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    const weights = await Promise.all([
        calcW1(metadata),
    ]);
    const description = "Catalyst Registration";
    const type = "catalyst_registration";
    const score = weights.reduce((sum, [weight]) => sum + weight, 0);
    return { type, description, score };
}
/**
 * label: 61284 (CIP-0015 - Catalyst registration) alongside
 * label: 61285 (CIP-0015 - Catalyst witness)
 *
 * @param metadata Transaction Metadata
 * @returns [Score, AdditionalData]
 */
async function calcW1(metadata) {
    if (!metadata.length)
        return [0, undefined];
    return [weighting.metadata * metadata.filter(({ label }) => label === "61284" || label === "61285").length / metadata.length, undefined];
}
