import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/wingriders_interaction/wingriders_withdraw_lp";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("wingriders_withdraw_lp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234,567,890 ADA-WMT LP Tokens from Wingriders",
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
                amount: -2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: 1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Wingriders Address",
            total: [
              {
                currency: "ADA",
                amount: 2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
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
    expect(transactionScore).toStrictEqual(liquidityRemovalScore);
    //#endregion
  });

  it("score: .2 - Unknown Activity", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "undefined",
      description: "Withdrew LP Tokens from Wingriders",
      score: .2,
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
                amount: -2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: 1234567890,
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
    expect(transactionScore).toStrictEqual(liquidityRemovalScore);
    //#endregion
  });

  it("score: .9 - Questionable Withdrawal", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234,567,890 ADA-WMT LP Tokens from Wingriders",
      score: .9,
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
                amount: -2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: 1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Wingriders Address",
            total: [
              {
                currency: "ADA",
                amount: 2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
        },
        withdrawal_amount: {
          currency: "ADA",
          amount: .5,
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
    expect(transactionScore).toStrictEqual(liquidityRemovalScore);
    //#endregion
  });

  it("score: .9 - Questionable Metadata", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234,567,890 ADA-WMT LP Tokens from Wingriders",
      score: .9,
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
                amount: -2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: 1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Wingriders Address",
            total: [
              {
                currency: "ADA",
                amount: 2,
              },
              {
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "721",
          json_metadata: {
            PolicyID: {
              AssetName: {
                name: "Token Name",
                image: "ipfs://QmV0CID",
              },
            },
            version: 2,
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
    expect(transactionScore).toStrictEqual(liquidityRemovalScore);
    //#endregion
  });
});
