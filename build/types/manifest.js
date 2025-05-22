"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = placeholder;
// import { bech32 } from "bech32";
const crypto_1 = require("crypto");
function placeholder() {
    // const uuid = Buffer.from(randomUUID(), "utf8");
    // const id = bech32.toWords(uuid);
    return {
        version: 0,
        id: (0, crypto_1.randomUUID)(), // bech32.encode("manifest", id),
        institution: {
            name: "Cardano",
            network: "Mainnet",
        },
        transactions: [],
    };
}
