import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_default_fallback";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("minswap_default_fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const defaultFallbackScore: TransactionScore = {
      type: "amm_dex",
      description: "Executed an order on Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Unknown Minswap Address",
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "SOME MINSWAP METADATA",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(defaultFallbackScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const defaultFallbackScore: TransactionScore = {
      type: "amm_dex",
      description: "Executed an order on Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: "amm_dex",
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Unknown Minswap Address",
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "SOME MINSWAP METADATA",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(defaultFallbackScore);
    //#endregion
  });

  it("score: .85", async () => {
    //#region Arrange
    const defaultFallbackScore: TransactionScore = {
      type: "amm_dex",
      description: "Executed an order on Minswap",
      score: .85,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Unknown Minswap Address",
          }] as Account[],
        },
        withdrawal_amount: {
          currency: "ADA",
          amount: 1,
        } as Asset,
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "SOME MINSWAP METADATA",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(defaultFallbackScore);
    //#endregion
  });

  it("score: .5", async () => {
    //#region Arrange
    const defaultFallbackScore: TransactionScore = {
      type: "amm_dex",
      description: "Executed an order on Minswap",
      score: .5,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "SOME MINSWAP METADATA",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(defaultFallbackScore);
    //#endregion
  });

  it("score: .75", async () => {
    //#region Arrange
    const defaultFallbackScore: TransactionScore = {
      type: "amm_dex",
      description: "Executed an order on Minswap",
      score: .75,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Unknown Script",
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "SOME MINSWAP METADATA",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(defaultFallbackScore);
    //#endregion
  });

  it("score: .5 - Unknown Address", async () => {
    //#region Arrange
    const defaultFallbackScore: TransactionScore = {
      type: "amm_dex",
      description: "Executed an order on Minswap",
      score: .5,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Unknown Address",
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "SOME MINSWAP METADATA",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(defaultFallbackScore);
    //#endregion
  });
});
