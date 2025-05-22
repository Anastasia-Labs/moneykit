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
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = exports.lucid = exports.cache = exports.bf = void 0;
exports.bf = __importStar(require("./blockfrost"));
exports.cache = __importStar(require("./cache"));
exports.lucid = __importStar(require("./lucid"));
const bf = __importStar(require("./blockfrost"));
const lucid = __importStar(require("./lucid"));
exports.util = {
    isKeyAddress: async (address) => {
        const { paymentCredential } = await lucid.getAddressDetails(address);
        return paymentCredential?.type === "Key";
    },
    isLovelaceOrADA: (currency) => {
        const c = currency.toLowerCase();
        return c === "lovelace" || c === "ada";
    },
    convertAmountToNumber: (amount, decimals) => {
        const t = BigInt(10 ** decimals);
        const a = amount / t;
        const b = (amount < 0n ? -amount : amount) % t;
        return parseFloat(`${a ? a : (amount < 0n ? "-0" : "0")}.${`${b}`.padStart(decimals, "0")}`);
    },
    getTotalAmounts: (amounts) => Promise.all(Object.keys(amounts)
        .filter((currency) => amounts[currency] !== 0n)
        .map(async (currency) => {
        let fromUnit = exports.util.isLovelaceOrADA(currency)
            ? { metadata: { name: currency, decimals: 6 } }
            : await bf.getAssetInfo(currency);
        if (fromUnit.error)
            fromUnit = { metadata: { name: currency, decimals: 0 } };
        const decimals = fromUnit.metadata?.decimals ?? 0;
        return {
            currency: fromUnit.metadata?.name ?? fromUnit.onchain_metadata?.name ?? fromUnit.fingerprint ?? currency,
            amount: exports.util.convertAmountToNumber(amounts[currency], decimals),
        };
    })),
    convertAddressAmountsToAccounts: (addressAmounts, addressRole, lookup) => Promise.all(Object.keys(addressAmounts).map(async (address) => {
        return {
            address,
            role: addressRole ?? lookup[address]?.role ?? `Unknown ${await exports.util.isKeyAddress(address) ? "Address" : "Script"}`,
            total: await exports.util.getTotalAmounts(addressAmounts[address]),
        };
    })),
    joinWords: (words) => {
        if (words.length < 2)
            return words.join("");
        if (words.length === 2)
            return words.join(" and ");
        const last = words.length - 1;
        return exports.util.joinWords([words.slice(0, last).join(", "), words[last]]);
    },
    formatAmount: (amount, currency) => 
    // TODO: Thousand Separator
    `${amount} ${currency}${Math.abs(amount) > 1 && currency.toLowerCase().endsWith("token") ? "s" : ""}`,
    weighMetadataMsg: (label, keywords, metadata) => {
        if (!metadata.length)
            return 0;
        const keywordsCount = keywords.length;
        const KEYWORDS = keywords.map((keyword) => keyword.toUpperCase());
        return metadata.filter((data) => data.label === label && data.json_metadata?.msg?.find((message) => {
            let hit = 0;
            let startPos = 0;
            for (const KEYWORD of KEYWORDS) {
                let k = message.toUpperCase().indexOf(KEYWORD, startPos);
                if (k < 0)
                    break;
                startPos = k + 1;
                hit += 1;
            }
            return hit === keywordsCount;
        })).length / metadata.length;
    },
};
