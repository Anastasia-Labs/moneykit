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
exports.scoring = void 0;
const minswap = __importStar(require("./minswap_interaction/_"));
const wingriders = __importStar(require("./wingriders_interaction/_"));
const nosc = __importStar(require("./non_script_interaction/_"));
const lookup = {
    Minswap: minswap,
    Wingriders: wingriders,
};
exports.scoring = {
    calcConfidenceScoreOf: async (intermediaryTx, probableProjects, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) => {
        const projectsConfidence = probableProjects.length
            ? await Promise.all(probableProjects.map((project) => confidenceOf(intermediaryTx, lookup[project]?.scoring ?? [], 99, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs)))
            : [await confidenceOf(intermediaryTx, nosc.scoring, 99, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs)];
        // maybe multiple dApps transactions are composed into this 1 transaction, in the future we can take the 2nd and 3rd confidence as well
        // that is why right now we're sorting this, even though only the highest one is taken at the moment
        const confidenceDesc = projectsConfidence.sort((l, r) => {
            return (r.confidence ?? 0) - (l.confidence ?? 0);
        });
        const highestConfidence = confidenceDesc[0];
        // if the highest confidence is below threshold (ie, 25-50), then use fallback because the description is likely to be wrong
        if (highestConfidence && highestConfidence.confidence !== null && highestConfidence.confidence < 40) {
            const fallbackConfidence = probableProjects.length
                ? await Promise.all(probableProjects.map((project) => confidenceOf(intermediaryTx, lookup[project] ? [lookup[project].fallback] : [], 99, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs)))
                : [await confidenceOf(intermediaryTx, [nosc.fallback], 0, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs)];
            return { ...intermediaryTx, ...fallbackConfidence[0] };
        }
        else {
            return { ...intermediaryTx, ...highestConfidence };
        }
    },
};
async function confidenceOf(intermediaryTx, scoring, maxConfidence, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    if (!scoring.length)
        return { ...intermediaryTx, confidence: null };
    const scores = await Promise.all(scoring.map((scoreOf) => {
        return scoreOf(intermediaryTx, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs);
    }));
    // in the future we can provide 2nd or 3rd altenative scores
    const scoresDesc = scores.sort((l, r) => {
        return r.score - l.score;
    });
    const { type, description, score } = scoresDesc[0];
    const adjustedScore = (score < .9) ? (score / 2) : ((score - .9) * 5 + .5);
    const confidence = Math.round(adjustedScore * maxConfidence);
    return { ...intermediaryTx, type, description, confidence };
}
