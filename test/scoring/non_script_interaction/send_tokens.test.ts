import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/send_tokens";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("send_tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const sendTokensScore: TransactionScore = {
      type: "send_tokens",
      description: "Sent 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
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
          other: [{
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
    expect(transactionScore).toStrictEqual(sendTokensScore);
    //#endregion
  });

  it("score: .25 - No User Account", async () => {
    //#region Arrange
    const sendTokensScore: TransactionScore = {
      type: "send_tokens",
      description: "Sent",
      score: .25,
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
    expect(transactionScore).toStrictEqual(sendTokensScore);
    //#endregion
  });

  it("score: .8 - No Other Account", async () => {
    //#region Arrange
    const sendTokensScore: TransactionScore = {
      type: "send_tokens",
      description: "Sent 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
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
    expect(transactionScore).toStrictEqual(sendTokensScore);
    //#endregion
  });

  it("score: .8 - OtherAccount receives ADA", async () => {
    //#region Arrange
    const sendTokensScore: TransactionScore = {
      type: "send_tokens",
      description: "Sent 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
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
          other: [{
            total: [{
              currency: "ADA",
              amount: 1.234567890,
            }] as Asset[],
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
    expect(transactionScore).toStrictEqual(sendTokensScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const sendTokensScore: TransactionScore = {
      type: "send_tokens",
      description: "Sent 0.1 A Token, 2.34 B Tokens and 56.789 C Tokens",
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
          other: [{
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
    expect(transactionScore).toStrictEqual(sendTokensScore);
    //#endregion
  });
});
