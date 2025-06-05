import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/wingriders_interaction/wingriders_liquidity_removal";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("wingriders_liquidity_removal", () => {
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
      description: "Withdrew 1,234.56789 ADA and 1,234,567.89 WMT from ADA-WMT pool on Wingriders",
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
                amount: 1234.567890,
              },
              {
                currency: "WMT",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
          other: [
            {
              role: "Wingriders Request",
              total: [{
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
              }] as Asset[],
            },
            {
              role: "Unknown Script",
              total: [
                {
                  currency: "WR-LPT-ADA/WMT",
                  amount: 1234567890,
                },
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "WMT",
                  amount: -1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
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

  it("score: 1 - Multi Pools", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234.56789 ADA, 123 WMT and 1,234,567.89 XYZ from ADA-WMT and ADA-XYZ pools on Wingriders",
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
                amount: 1234.567890,
              },
              {
                currency: "WMT",
                amount: 123,
              },
              {
                currency: "XYZ",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
          other: [
            {
              role: "Wingriders Request",
              total: [
                {
                  currency: "WR-LPT-ADA/WMT",
                  amount: -12345,
                }, {
                  currency: "WR-LPT-ADA/XYZ",
                  amount: -67890,
                },
              ] as Asset[],
            },
            {
              role: "Unknown Script",
              total: [
                {
                  currency: "WR-LPT-ADA/WMT",
                  amount: 12345,
                },
                {
                  currency: "WR-LPT-ADA/XYZ",
                  amount: 67890,
                },
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "WMT",
                  amount: -123,
                },
                {
                  currency: "XYZ",
                  amount: -1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
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

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234.56789 ADA and 1,234,567.89 WMT from ADA-WMT pool on Wingriders",
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
                amount: 1234.567890,
              },
              {
                currency: "WMT",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
          other: [
            {
              role: "Wingriders Request",
              total: [{
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
              }] as Asset[],
            },
            {
              role: "Unknown Script",
              total: [
                {
                  currency: "WR-LPT-ADA/WMT",
                  amount: 1234567890,
                },
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "WMT",
                  amount: -1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
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

  it("score: 0 - Unknown Activity", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "undefined",
      description: "Unknown Activity",
      score: 0,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        description: "Unknown Activity",
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: 1234.567890,
              },
              {
                currency: "WMT",
                amount: 1234567.890,
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

  it("score: .95 - Questionable Withdrawal", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234.56789 ADA and 1,234,567.89 WMT from ADA-WMT pool on Wingriders",
      score: .95,
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
                amount: 1234.567890,
              },
              {
                currency: "WMT",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
          other: [
            {
              role: "Wingriders Request",
              total: [{
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
              }] as Asset[],
            },
            {
              role: "Unknown Script",
              total: [
                {
                  currency: "WR-LPT-ADA/WMT",
                  amount: 1234567890,
                },
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "WMT",
                  amount: -1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
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

  it("score: .95 - Questionable Metadata", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,234.56789 ADA and 1,234,567.89 WMT from ADA-WMT pool on Wingriders",
      score: .95,
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
                amount: 1234.567890,
              },
              {
                currency: "WMT",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
          other: [
            {
              role: "Wingriders Request",
              total: [{
                currency: "WR-LPT-ADA/WMT",
                amount: -1234567890,
              }] as Asset[],
            },
            {
              role: "Unknown Script",
              total: [
                {
                  currency: "WR-LPT-ADA/WMT",
                  amount: 1234567890,
                },
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "WMT",
                  amount: -1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
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
    expect(transactionScore).toEqual(liquidityRemovalScore);
    //#endregion
  });

  it("score: 0 - Other Activity", async () => {
    //#region Arrange
    const liquidityRemovalScore: TransactionScore = {
      type: "send_ada",
      description: "Sent 1,234.56789 ADA",
      score: 0,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: "send_ada",
        description: "Sent 1,234.56789 ADA",
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -1234.567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
            total: [
              {
                currency: "ADA",
                amount: 1234.567890,
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
    expect(transactionScore).toStrictEqual(liquidityRemovalScore);
    //#endregion
  });
});
