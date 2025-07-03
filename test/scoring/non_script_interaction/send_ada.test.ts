import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/send_ada";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("send_ada", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const sendAdaScore: TransactionScore = {
      type: "send_ada",
      description: "Sent 1,233.333322 ADA",
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
              amount: -1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: 1.234567890,
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
    expect(transactionScore).toStrictEqual(sendAdaScore);
    //#endregion
  });

  it("score: .25 - No User Account", async () => {
    //#region Arrange
    const sendAdaScore: TransactionScore = {
      type: "send_ada",
      description: "Sent NaN ADA",
      score: .25,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Unknown Address",
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: 1.234567890,
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
    expect(transactionScore).toStrictEqual(sendAdaScore);
    //#endregion
  });

  it("score: .8 - No Other Account", async () => {
    //#region Arrange
    const sendAdaScore: TransactionScore = {
      type: "send_ada",
      description: "Sent 1,233.333322 ADA",
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
              amount: -1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: 1.234567890,
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
    expect(transactionScore).toStrictEqual(sendAdaScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const sendAdaScore: TransactionScore = {
      type: "send_ada",
      description: "Sent 1,233.333322 ADA",
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
              amount: -1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
            total: [{
              currency: "ADA",
              amount: 1234.567890,
            }] as Asset[],
          }] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: 1.234567890,
        } as Asset,
        metadata: [{}] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(sendAdaScore);
    //#endregion
  });
});
