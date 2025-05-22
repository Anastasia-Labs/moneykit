"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressDetails = getAddressDetails;
exports.paymentCredentialOf = paymentCredentialOf;
exports.stakeCredentialOf = stakeCredentialOf;
exports.fromText = fromText;
exports.toText = toText;
const _1 = require("./_");
async function getAddressDetails(address) {
    const key = `lucid.getAddressDetails(${address})`;
    const data = _1.cache.get(key);
    if (data)
        return data;
    const { getAddressDetails } = await import("@lucid-evolution/lucid");
    const addressDetails = getAddressDetails(address);
    _1.cache.set(key, addressDetails, 60_000);
    return addressDetails;
}
async function paymentCredentialOf(address) {
    const key = `lucid.paymentCredentialOf(${address})`;
    const data = _1.cache.get(key);
    if (data)
        return data;
    const { paymentCredentialOf } = await import("@lucid-evolution/lucid");
    const paymentCredential = paymentCredentialOf(address);
    _1.cache.set(key, paymentCredential, 60_000);
    return paymentCredential;
}
async function stakeCredentialOf(rewardAddress) {
    const key = `lucid.stakeCredentialOf(${rewardAddress})`;
    const data = _1.cache.get(key);
    if (data)
        return data;
    const { stakeCredentialOf } = await import("@lucid-evolution/lucid");
    const stakeCredential = stakeCredentialOf(rewardAddress);
    _1.cache.set(key, stakeCredential, 60_000);
    return stakeCredential;
}
async function fromText(text) {
    const key = `lucid.fromText(${text})`;
    const data = _1.cache.get(key);
    if (data)
        return data;
    const { fromText } = await import("@lucid-evolution/lucid");
    const hex = fromText(text);
    _1.cache.set(key, hex, 60_000);
    return hex;
}
async function toText(hex) {
    const key = `lucid.toText(${hex})`;
    const data = _1.cache.get(key);
    if (data)
        return data;
    const { toText } = await import("@lucid-evolution/lucid");
    const text = toText(hex);
    _1.cache.set(key, text, 60_000);
    return text;
}
