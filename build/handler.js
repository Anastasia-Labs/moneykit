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
exports.getDescriberStats = getDescriberStats;
exports.describeAddressTransactions = describeAddressTransactions;
exports.describeSpecificAddressTransaction = describeSpecificAddressTransaction;
const svc = __importStar(require("./svc/_"));
async function getDescriberStats(req, rsp) {
    try {
        const stats = await svc.describer
            .getStats();
        rsp.json(stats);
    }
    catch (error) {
        _respondError(req, rsp, error);
    }
}
async function describeAddressTransactions(req, rsp) {
    try {
        const { ip } = req;
        if (!ip)
            throw {
                status_code: 403,
                message: "Unidentifiable Requester",
            };
        const reqTime = new Date().getTime();
        const count = parseInt(`${req.query.count ?? 5}`);
        if (count < 1)
            throw {
                status_code: 400,
                message: "Minimum count is 1 transaction per request.",
            };
        if (count > 10)
            throw {
                status_code: 400,
                message: "Maximum count is 10 transactions per request.",
            };
        const descriptions = await svc.describer
            .describeAddressTransactions(req.params.address, count);
        rsp.json(descriptions);
        const rspTime = new Date().getTime();
        _log(ip, // client identifier:
        { path: req.path, time: reqTime }, // request path and time,
        { body: JSON.stringify(descriptions), time: rspTime }, // response body and time,
        { uuid: descriptions.id, time: rspTime - reqTime });
    }
    catch (error) {
        _respondError(req, rsp, error);
    }
}
;
async function describeSpecificAddressTransaction(req, rsp) {
    try {
        const { ip } = req;
        if (!ip)
            throw {
                status_code: 403,
                message: "Unidentifiable Requester",
            };
        const reqTime = new Date().getTime();
        const description = await svc.describer
            .describeSpecificAddressTransaction(req.params.address, req.params.hash);
        rsp.json(description);
        const rspTime = new Date().getTime();
        _log(ip, // client identifier:
        { path: req.path, time: reqTime }, // request path and time,
        { body: JSON.stringify(description), time: rspTime }, // response body and time,
        { uuid: description.id, time: rspTime - reqTime });
    }
    catch (error) {
        _respondError(req, rsp, error);
    }
}
;
function _log(client, request, response, process) {
    console.log({ client, request, response, process });
}
function _logError(client, path, time, error) {
    console.error({ client, path, time, error });
}
function _respondError(request, response, error, status = 500) {
    const { ip, path } = request;
    const time = new Date().getTime();
    response
        .status(error.status_code ?? status)
        .json({ error: error.message ?? error });
    _logError(ip, path, time, error);
}
;
