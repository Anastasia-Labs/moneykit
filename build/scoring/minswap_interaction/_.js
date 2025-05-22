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
const minswap_create_tx = __importStar(require("./minswap_create_swap_tx"));
const minswap_swap_tx = __importStar(require("./minswap_swap_tx"));
const minswap_create_withdraw_liquidity = __importStar(require("./minswap_create_withdraw_liquidity"));
const minswap_withdraw_liquidity = __importStar(require("./minswap_withdraw_liquidity"));
const minswap_masterchef = __importStar(require("./minswap_masterchef"));
const minswap_create_withdraw_tx = __importStar(require("./minswap_create_withdraw_tx"));
const minswap_withdraw_tx = __importStar(require("./minswap_withdraw_tx"));
const minswap_stake_min = __importStar(require("./minswap_stake_min"));
const minswap_unstake_min = __importStar(require("./minswap_unstake_min"));
const minswap_receive_staking_rewards = __importStar(require("./minswap_receive_staking_rewards"));
const minswap_create_deposit_tx = __importStar(require("./minswap_create_deposit_tx"));
const minswap_stake_liquidity = __importStar(require("./minswap_stake_liquidity"));
const minswap_create_zap_out = __importStar(require("./minswap_create_zap_out"));
const minswap_zap_out = __importStar(require("./minswap_zap_out"));
const minswap_default_fallback = __importStar(require("./minswap_default_fallback"));
exports.scoring = [
    minswap_create_tx.score,
    minswap_swap_tx.score,
    minswap_create_withdraw_liquidity.score,
    minswap_withdraw_liquidity.score,
    minswap_masterchef.score,
    minswap_create_withdraw_tx.score,
    minswap_withdraw_tx.score,
    minswap_stake_min.score,
    minswap_unstake_min.score,
    minswap_receive_staking_rewards.score,
    minswap_create_deposit_tx.score,
    minswap_stake_liquidity.score,
    minswap_create_zap_out.score,
    minswap_zap_out.score,
];
exports.fallback = minswap_default_fallback.score;
