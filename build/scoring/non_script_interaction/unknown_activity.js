"use strict";
// type: unknown_activity
// description: Unknown Activity
Object.defineProperty(exports, "__esModule", { value: true });
exports.score = score;
async function score({}, bfAddressInfo, lucidAddressDetails, txInfo, txUTXOs) {
    return {
        type: "unknown_activity",
        description: "Unknown Activity",
        score: 1,
    };
}
