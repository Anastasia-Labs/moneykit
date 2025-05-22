"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
exports.describeAddressTransactions = describeAddressTransactions;
exports.describeSpecificAddressTransaction = describeSpecificAddressTransaction;
const file = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require("../types/_");
const _2 = require("../util/_");
const _3 = require("../scoring/_");
//#region Initialize Known Dapps
const dappsPath = "./crfa-offchain-data-registry/dApps";
const dapps = file.readdirSync(dappsPath);
const distinctProjects = new Set();
const distinctCategories = new Set([
    "unknown_activity",
    // "self_transaction",
    "catalyst_registration",
    "catalyst_deregistration",
    "receive_ada",
    "send_ada",
    "receive_tokens",
    "send_tokens",
    "token_minting",
    "stake_registration",
    "stake_delegation",
    "multi_stake_delegation",
    "setup_collateral",
    "yield_farming",
]);
const scDesc = {};
for (const dapp of dapps) {
    const dappPath = path_1.default.join(dappsPath, dapp);
    const dappFile = file.readFileSync(dappPath).toString();
    const { projectName, category, subCategory, scripts } = JSON.parse(dappFile);
    for (const { name, versions } of scripts) {
        for (const { contractAddress } of versions) {
            const tranType = `${!subCategory || subCategory === '-' ? category : subCategory}`
                .replaceAll(" ", "_")
                .toLowerCase();
            scDesc[contractAddress] = {
                name,
                projectName,
                category: tranType === "dex" ? "other_dex" : tranType,
                description: `${name ?? "Unknown activity"} on ${projectName}`,
                role: `${name}`.startsWith(projectName) ? name : `${projectName} ${name ?? "Address"}`,
            };
            distinctProjects.add(scDesc[contractAddress].projectName);
            distinctCategories.add(scDesc[contractAddress].category);
        }
    }
}
const stats = {
    category: {
        names: [...distinctCategories].sort((l, r) => l < r ? -1 : 1),
        count: distinctCategories.size,
    },
    merchant: {
        names: [...distinctProjects].sort((l, r) => l.toLowerCase() < r.toLowerCase() ? -1 : 1),
        count: distinctProjects.size,
    },
};
//#endregion
async function getStats() {
    return stats;
}
async function describeAddressTransactions(address, count) {
    const addressTransactions = await _2.bf.getAddressTransactions(address);
    if (addressTransactions.error)
        throw addressTransactions;
    const addressTransactionsManifest = [];
    // DO NOT BURST BLOCKFROST BY USING Promise.all
    for (let c = 0; c < count && c < addressTransactions.length; c++) {
        const hash = addressTransactions[c].tx_hash;
        const { transactions } = await describeSpecificAddressTransaction(address, hash);
        if (transactions.length)
            addressTransactionsManifest.push(transactions[0]);
    }
    return {
        ..._1.manifest.default(),
        transactions: addressTransactionsManifest,
    };
}
async function describeSpecificAddressTransaction(address, hash) {
    //#region Blockfrost AddressInfo
    const addressInfo = await _2.bf.getAddressInfo(address);
    if (addressInfo.error)
        throw addressInfo;
    const stakeAddressBech32 = addressInfo.stake_address;
    //#endregion
    //#region Lucid AddressDetails
    const addressDetails = await _2.lucid.getAddressDetails(address);
    //#endregion
    //#region Tx Info
    const tx = await _2.bf.getTransactionInfo(hash);
    if (tx.error)
        throw {
            status_code: 400,
            message: "Invalid or malformed transaction hash.",
        };
    const timestamp = tx.block_time * 1_000;
    const networkFee = BigInt(tx.fees);
    //#endregion
    //#region Tx UTXOs
    const addressAmounts = {};
    const userAddressAmounts = {};
    const otherAddressAmounts = {};
    let tranType = undefined;
    let tranDesc = undefined;
    // let actualFee = 0n;
    const probableProjects = new Set();
    const utxos = await _2.bf.getTransactionUTXOs(hash);
    if (utxos.error)
        throw utxos;
    const { inputs, outputs } = utxos;
    //#region Process UTxO Inputs
    for (const { address, amount, collateral, reference } of inputs) {
        if (collateral || reference)
            continue;
        if (!addressAmounts[address])
            addressAmounts[address] = {};
        for (const { unit, quantity } of amount) {
            const currency = unit === "lovelace" ? "ADA" : unit;
            const amount = BigInt(quantity);
            addressAmounts[address][currency] = (addressAmounts[address][currency] ?? 0n) - amount;
            // if (currency === "ADA") actualFee -= amount;
        }
        if (scDesc[address]) {
            tranType = scDesc[address].category;
            tranDesc = scDesc[address].description;
            probableProjects.add(scDesc[address].projectName);
        }
    }
    //#endregion
    //#region Process UTxO Outputs
    for (const { address, amount, collateral, reference } of outputs) {
        if (collateral || reference)
            continue;
        if (!addressAmounts[address])
            addressAmounts[address] = {};
        for (const { unit, quantity } of amount) {
            const currency = unit === "lovelace" ? "ADA" : unit;
            const amount = BigInt(quantity);
            addressAmounts[address][currency] = (addressAmounts[address][currency] ?? 0n) + amount;
            // if (currency === "ADA") actualFee += amount;
        }
        if (scDesc[address]) {
            tranType = scDesc[address].category;
            tranDesc = scDesc[address].description;
            probableProjects.add(scDesc[address].projectName);
        }
    }
    //#endregion
    //#region Group AddressAmounts by PKH / SKH
    for (const key of Object.keys(addressAmounts)) {
        const { paymentCredential, stakeCredential } = await _2.lucid.getAddressDetails(key);
        if ((paymentCredential && paymentCredential.hash === addressDetails.paymentCredential?.hash) ||
            (stakeCredential && stakeCredential.hash === addressDetails.stakeCredential?.hash)) {
            userAddressAmounts[key] = addressAmounts[key];
        }
        else {
            otherAddressAmounts[key] = addressAmounts[key];
        }
    }
    //#endregion
    //#endregion
    //#region Tx Metadata
    let metadata = await _2.bf.getTransactionMetadata(hash);
    if (metadata.error)
        metadata = [];
    for (const { json_metadata } of metadata) {
        if (json_metadata?.msg?.length) {
            for (const project of distinctProjects) {
                if (json_metadata.msg[0].toUpperCase().includes(project.toUpperCase())) {
                    probableProjects.add(project);
                }
            }
        }
    }
    //#endregion
    //#region Tx Withdrawals
    // const withdrawalAmount = networkFee - actualFee;
    let withdrawalAmount = 0n;
    const withdrawals = await _2.bf.getTransactionWithdrawals(hash);
    if (withdrawals && !withdrawals.error && withdrawals.length) {
        withdrawalAmount = withdrawals.reduce((sum, withdrawal) => sum += withdrawal.address === stakeAddressBech32 ? BigInt(withdrawal.amount) : 0n, 0n);
    }
    //#endregion
    //#region Intermediary TxObject
    const transaction = {
        transaction_id: hash,
        timestamp,
        type: `${tranType}`,
        description: `${tranDesc}`,
        confidence: null,
        accounts: {
            user: await _2.util.convertAddressAmountsToAccounts(userAddressAmounts, "User Address", scDesc),
            other: await _2.util.convertAddressAmountsToAccounts(otherAddressAmounts, undefined, scDesc),
        },
        withdrawal_amount: !withdrawalAmount ? undefined : {
            currency: "ADA",
            amount: _2.util.convertAmountToNumber(withdrawalAmount, 6),
        },
        network_fee: {
            currency: "ADA",
            amount: _2.util.convertAmountToNumber(networkFee, 6),
        },
        metadata,
    };
    //#endregion
    //#region Post-process TxObject
    const highestConfidence = await _3.scoring.calcConfidenceScoreOf(transaction, [...probableProjects], addressInfo, addressDetails, tx, utxos);
    //#endregion
    return {
        ..._1.manifest.default(),
        transactions: [highestConfidence],
    };
}
