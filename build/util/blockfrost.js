"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolMetadata = exports.getDatum = exports.getAssetInfo = exports.getTransactionWithdrawals = exports.getTransactionDelegations = exports.getTransactionMetadata = exports.getTransactionUTXOs = exports.getTransactionInfo = exports.getAddressTransactions = exports.getAddressInfo = void 0;
const process_1 = require("process");
const _1 = require("./_");
const { BF_PID, BF_URL } = process_1.env;
async function req(path, cacheTimeoutSec = 60_000) {
    const key = `bf.${path}`;
    const data = _1.cache.get(key);
    if (data)
        return data;
    const resp = await fetch(`${BF_URL}${path}`, { headers: { project_id: `${BF_PID}` } });
    const json = await resp.json();
    _1.cache.set(key, json, cacheTimeoutSec);
    return json;
}
const getAddressInfo = (address) => req(`/addresses/${address}`);
exports.getAddressInfo = getAddressInfo;
const getAddressTransactions = (address) => req(`/addresses/${address}/transactions?order=desc`, 60);
exports.getAddressTransactions = getAddressTransactions;
const getTransactionInfo = (hash) => req(`/txs/${hash}`);
exports.getTransactionInfo = getTransactionInfo;
const getTransactionUTXOs = (hash) => req(`/txs/${hash}/utxos`);
exports.getTransactionUTXOs = getTransactionUTXOs;
const getTransactionMetadata = (hash) => req(`/txs/${hash}/metadata`);
exports.getTransactionMetadata = getTransactionMetadata;
const getTransactionDelegations = (hash) => req(`/txs/${hash}/delegations`);
exports.getTransactionDelegations = getTransactionDelegations;
const getTransactionWithdrawals = (hash) => req(`/txs/${hash}/withdrawals`);
exports.getTransactionWithdrawals = getTransactionWithdrawals;
const getAssetInfo = (unit) => req(`/assets/${unit}`);
exports.getAssetInfo = getAssetInfo;
const getDatum = (hash) => req(`/scripts/datum/${hash}`);
exports.getDatum = getDatum;
const getPoolMetadata = (id) => req(`/pools/${id}/metadata`);
exports.getPoolMetadata = getPoolMetadata;
//#endregion
