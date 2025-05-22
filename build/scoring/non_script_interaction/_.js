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
exports.fallback = exports.scoring = void 0;
const receive_ada = __importStar(require("./receive_ada"));
const sent_ada = __importStar(require("./send_ada"));
const receive_tokens = __importStar(require("./receive_tokens"));
const sent_tokens = __importStar(require("./send_tokens"));
const token_minting = __importStar(require("./token_minting"));
const catalyst_registration = __importStar(require("./catalyst_registration"));
const catalyst_deregistration = __importStar(require("./catalyst_deregistration"));
const stake_delegation = __importStar(require("./stake_delegation"));
const multi_stake_delegation = __importStar(require("./multi_stake_delegation"));
const setup_collateral = __importStar(require("./setup_collateral"));
// import * as self_transaction from "./self_transaction";
const default_fallback = __importStar(require("./unknown_activity"));
exports.scoring = [
    receive_ada.score,
    sent_ada.score,
    receive_tokens.score,
    sent_tokens.score,
    token_minting.score,
    catalyst_registration.score,
    catalyst_deregistration.score,
    stake_delegation.score,
    multi_stake_delegation.score,
    setup_collateral.score,
    // self_transaction.score,
];
exports.fallback = default_fallback.score;
