import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/self_transaction";
import { Account, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("self_transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const selfTransactionScore: TransactionScore = {
      type: "self_transaction",
      description: "Self Transaction",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{}] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(selfTransactionScore);
    //#endregion
  });

  it("score: .5 - No User Account", async () => {
    //#region Arrange
    const selfTransactionScore: TransactionScore = {
      type: "self_transaction",
      description: "Self Transaction",
      score: .5,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(selfTransactionScore);
    //#endregion
  });

  it("score: .5 - Unexpected Other Accounts", async () => {
    //#region Arrange
    const selfTransactionScore: TransactionScore = {
      type: "self_transaction",
      description: "Self Transaction",
      score: .5,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{}] as Account[],
          other: [{}] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(selfTransactionScore);
    //#endregion
  });
});
