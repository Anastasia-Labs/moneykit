import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/receive_ada";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("receive_ada", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const receiveAdaScore: TransactionScore = {
      type: "receive_ada",
      description: "Received 1,234.56789 ADA",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
          }] as Account[],
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
    expect(transactionScore).toStrictEqual(receiveAdaScore);
    //#endregion
  });

  it("score: .55 - Received NaN ADA", async () => {
    //#region Arrange
    const receiveAdaScore: TransactionScore = {
      type: "receive_ada",
      description: "Received NaN ADA",
      score: .55,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
          }] as Account[],
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
    expect(transactionScore).toStrictEqual(receiveAdaScore);
    //#endregion
  });

  it("score: .7 - No Other Account", async () => {
    //#region Arrange
    const receiveAdaScore: TransactionScore = {
      type: "receive_ada",
      description: "Received 1,234.56789 ADA",
      score: .7,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
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
    expect(transactionScore).toStrictEqual(receiveAdaScore);
    //#endregion
  });

  it("score: .8 - Unexpected Withdrawal", async () => {
    //#region Arrange
    const receiveAdaScore: TransactionScore = {
      type: "receive_ada",
      description: "Received 1,234.56789 ADA",
      score: .8,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
          }] as Account[],
        },
        withdrawal_amount: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(receiveAdaScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const receiveAdaScore: TransactionScore = {
      type: "receive_ada",
      description: "Received 1,234.56789 ADA",
      score: .95,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
          }] as Account[],
        },
        metadata: [{}] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(receiveAdaScore);
    //#endregion
  });
});
