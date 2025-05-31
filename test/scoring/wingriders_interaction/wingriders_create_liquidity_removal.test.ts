import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/wingriders_interaction/wingriders_create_liquidity_removal";
import { Account, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("wingriders_create_liquidity_removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const createLiquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a liquidity removal order (withdraw Xx-Yy) on Wingriders",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: -5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: -55555,
              },
            ],
          }] as Account[],
          other: [{
            role: "Wingriders Address",
            total: [
              {
                currency: "ADA",
                amount: 5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: 55555,
              },
            ],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(createLiquidityRemovalScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const createLiquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a liquidity removal order (withdraw Xx-Yy) on Wingriders",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: "amm_dex",
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: -5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: -55555,
              },
            ],
          }] as Account[],
          other: [{
            role: "Wingriders Address",
            total: [
              {
                currency: "ADA",
                amount: 5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: 55555,
              },
            ],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(createLiquidityRemovalScore);
    //#endregion
  });

  it("score: .6", async () => {
    //#region Arrange
    const createLiquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a liquidity removal order on Wingriders",
      score: .6,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [{
            role: "Wingriders Address",
            total: [
              {
                currency: "ADA",
                amount: 5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: 55555,
              },
            ],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(createLiquidityRemovalScore);
    //#endregion
  });

  it("score: .5", async () => {
    //#region Arrange
    const createLiquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a liquidity removal order (withdraw Xx-Yy) on Wingriders",
      score: .5,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: -5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: -55555,
              },
            ],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(createLiquidityRemovalScore);
    //#endregion
  });

  it("score: .5 - UnknownScript at OtherAccount", async () => {
    //#region Arrange
    const createLiquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a liquidity removal order (withdraw Xx-Yy) on Wingriders",
      score: .5,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: -5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: -55555,
              },
            ],
          }] as Account[],
          other: [{
            role: "Unknown Script",
            total: [
              {
                currency: "ADA",
                amount: 5,
              },
              {
                currency: "WR-LPT-Xx/Yy",
                amount: 55555,
              },
              {
                currency: "OTHER Token",
                amount: 22,
              },
            ],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(createLiquidityRemovalScore);
    //#endregion
  });
});
