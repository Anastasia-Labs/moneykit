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
require("dotenv").config();
const process_1 = require("process");
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api = __importStar(require("./handler"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process_1.env.HOSTED ? parseInt(`${process_1.env.PORT}`) : 35183;
const server = app.listen(port, () => console.log(process_1.env.HOSTED ? server.address() : `http://localhost:${port}`));
const notFound = (req, rsp) => {
    rsp.status(404);
    rsp.json({ error: `Cannot ${req.method} ${req.path}` });
};
const dailyLimit = (0, express_rate_limit_1.default)({
    limit: 50_000,
    windowMs: 86_400_000,
    keyGenerator: () => "globalDailyLimit",
    handler: (_, rsp) => rsp.status(429).json({ error: "Daily limit reached!" }),
});
const burstLimit = (0, express_rate_limit_1.default)({
    limit: 10,
    windowMs: 1_000,
    keyGenerator: () => "globalBurstLimit",
    handler: (_, rsp) => rsp.status(429).json({ error: "Burst limit reached!" }),
});
//////////////////////////////////////////////////////////////// API Endpoints ////////////////////////////////////////////////////////////////
//#region API v0
app.get("/api/v0/addresses/:address", burstLimit, dailyLimit, api.describeAddressTransactions);
app.get("/api/v0/addresses/:address/txs/:hash", burstLimit, dailyLimit, api.describeSpecificAddressTransaction);
app.get("/api/v0/stats", api.getDescriberStats);
app.all("*", notFound);
//#endregion
