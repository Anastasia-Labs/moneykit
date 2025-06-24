import { Effect } from "effect";
import { AddressDetails } from "@lucid-evolution/lucid";

import { Transaction } from "../../Domain/Manifest";
import { TransactionScore } from "../../Domain/Types";

import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../Service/Blockfrost";

export const UnknownActivity = {
  score:
    (
      {}: Transaction,
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) => {
      const txScore: TransactionScore = {
        type: "unknown_activity",
        description: "Unknown Activity",
        score: 1.00,
      };
      return Effect.succeed(txScore);
    }
};
