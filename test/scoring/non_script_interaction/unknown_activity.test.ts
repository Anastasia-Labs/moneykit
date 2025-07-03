import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/unknown_activity";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { Transaction } from "../../../src/types/manifest";

describe("unknown_activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score", async () => {
    //#region Arrange
    const unknownActivityScore: TransactionScore = {
      type: "unknown_activity",
      description: "Unknown Activity",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {} as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(unknownActivityScore);
    //#endregion
  });
});
