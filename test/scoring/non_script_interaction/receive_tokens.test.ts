import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/receive_tokens";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("receive_tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const receiveTokensScore: TransactionScore = {
      type: "receive_tokens",
      description: "Received 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
              },
              {
                currency: "A Token",
                amount: .1,
              },
              {
                currency: "B Token",
                amount: 2.34,
              },
              {
                currency: "C Token",
                amount: 56.789,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "A Token",
                amount: -.1,
              },
              {
                currency: "B Token",
                amount: -2.34,
              },
              {
                currency: "C Token",
                amount: -56.789,
              },
            ] as Asset[],
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
    expect(transactionScore).toStrictEqual(receiveTokensScore);
    //#endregion
  });

  it("score: .55 - No User Account", async () => {
    //#region Arrange
    const receiveTokensScore: TransactionScore = {
      type: "receive_tokens",
      description: "Received",
      score: .55,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [] as Account[],
          other: [{
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "A Token",
                amount: -.1,
              },
              {
                currency: "B Token",
                amount: -2.34,
              },
              {
                currency: "C Token",
                amount: -56.789,
              },
            ] as Asset[],
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
    expect(transactionScore).toStrictEqual(receiveTokensScore);
    //#endregion
  });

  it("score: .55 - Received ADA", async () => {
    //#region Arrange
    const receiveTokensScore: TransactionScore = {
      type: "receive_tokens",
      description: "Received",
      score: .55,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: 1.234567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "A Token",
                amount: -.1,
              },
              {
                currency: "B Token",
                amount: -2.34,
              },
              {
                currency: "C Token",
                amount: -56.789,
              },
            ] as Asset[],
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
    expect(transactionScore).toStrictEqual(receiveTokensScore);
    //#endregion
  });

  it("score: .7 - No Other Account", async () => {
    //#region Arrange
    const receiveTokensScore: TransactionScore = {
      type: "receive_tokens",
      description: "Received 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
      score: .7,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
              },
              {
                currency: "A Token",
                amount: .1,
              },
              {
                currency: "B Token",
                amount: 2.34,
              },
              {
                currency: "C Token",
                amount: 56.789,
              },
            ] as Asset[],
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
    expect(transactionScore).toStrictEqual(receiveTokensScore);
    //#endregion
  });

  it("score: .8 - Unexpected Withdrawal", async () => {
    //#region Arrange
    const receiveTokensScore: TransactionScore = {
      type: "receive_tokens",
      description: "Received 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
      score: .8,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
              },
              {
                currency: "A Token",
                amount: .1,
              },
              {
                currency: "B Token",
                amount: 2.34,
              },
              {
                currency: "C Token",
                amount: 56.789,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "A Token",
                amount: -.1,
              },
              {
                currency: "B Token",
                amount: -2.34,
              },
              {
                currency: "C Token",
                amount: -56.789,
              },
            ] as Asset[],
          }] as Account[],
        },
        withdrawal_amount: {
          currency: "ADA",
          amount: .123456789,
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
    expect(transactionScore).toStrictEqual(receiveTokensScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const receiveTokensScore: TransactionScore = {
      type: "receive_tokens",
      description: "Received 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
      score: .95,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
              },
              {
                currency: "A Token",
                amount: .1,
              },
              {
                currency: "B Token",
                amount: 2.34,
              },
              {
                currency: "C Token",
                amount: 56.789,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "A Token",
                amount: -.1,
              },
              {
                currency: "B Token",
                amount: -2.34,
              },
              {
                currency: "C Token",
                amount: -56.789,
              },
            ] as Asset[],
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
    expect(transactionScore).toStrictEqual(receiveTokensScore);
    //#endregion
  });
});
