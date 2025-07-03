import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/catalyst_registration";
import { Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("catalyst_registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const catalystRegistrationScore: TransactionScore = {
      type: "catalyst_registration",
      description: "Catalyst Registration",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        metadata: [
          { label: "61284" }, // registration w/ arbitrary `json_metadata`
          { label: "61285" }, // witness with arbitrary `json_metadata`
        ] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(catalystRegistrationScore);
    //#endregion
  });

  it("score: 0", async () => {
    //#region Arrange
    const catalystRegistrationScore: TransactionScore = {
      type: "catalyst_registration",
      description: "Catalyst Registration",
      score: 0,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(catalystRegistrationScore);
    //#endregion
  });
});
