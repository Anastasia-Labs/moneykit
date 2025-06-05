import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/wingriders_interaction/wingriders_harvest";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("wingriders_harvest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const harvestScore: TransactionScore = {
      type: "yield_farming",
      description: "Harvested 1,234.56789 WRT from Wingriders",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          other: [
            {
              role: "Unknown Script",
              total: [{
                currency: "ADA",
                amount: 55555,
              }],
            },
            {
              role: "Wingriders Farm",
              total: [{
                currency: "WRT",
                amount: -1234.567890,
              }],
            },
            {
              role: "Unknown Address",
              total: [{
                currency: "ADA",
                amount: -55555,
              }],
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
    expect(transactionScore).toStrictEqual(harvestScore);
    //#endregion
  });

  it("score: .2 - Unknown Activity", async () => {
    //#region Arrange
    const harvestScore: TransactionScore = {
      type: "undefined",
      description: "Unknown Activity",
      score: .2,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        description: "Unknown Activity",
        accounts: {
          other: [{
            role: "Wingriders Farm",
            total: [] as Asset[],
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
    expect(transactionScore).toStrictEqual(harvestScore);
    //#endregion
  });

  it("score: .9 - Questionable Withdrawal", async () => {
    //#region Arrange
    const harvestScore: TransactionScore = {
      type: "yield_farming",
      description: "Harvested 1,234.56789 WRT from Wingriders",
      score: .9,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          other: [{
            role: "Wingriders Farm",
            total: [{
              currency: "WRT",
              amount: -1234.567890,
            }] as Asset[],
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
    expect(transactionScore).toStrictEqual(harvestScore);
    //#endregion
  });

  it("score: .9 - Questionable Metadata", async () => {
    //#region Arrange
    const harvestScore: TransactionScore = {
      type: "yield_farming",
      description: "Harvested 1,234.56789 WRT from Wingriders",
      score: .9,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          other: [{
            role: "Wingriders Farm",
            total: [{
              currency: "WRT",
              amount: -1234.567890,
            }] as Asset[],
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
    expect(transactionScore).toStrictEqual(harvestScore);
    //#endregion
  });
});
