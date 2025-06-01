import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_masterchef";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("minswap_masterchef", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const masterchefScore: TransactionScore = {
      type: "amm_dex",
      description: "Received 1,234.56789 ADA and 1,234,567.89 ELEMENT from Minswap",
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
                currency: "ELEMENT",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP MASTERCHEF",
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
    expect(transactionScore).toStrictEqual(masterchefScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const masterchefScore: TransactionScore = {
      type: "amm_dex",
      description: "Received 1,234.56789 ADA and 1,234,567.89 ELEMENT from Minswap",
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
                currency: "ELEMENT",
                amount: 1234567.890,
              },
            ] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP MASTERCHEF",
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
    expect(transactionScore).toStrictEqual(masterchefScore);
    //#endregion
  });

  it("score: 0", async () => {
    //#region Arrange
    const masterchefScore: TransactionScore = {
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
          user: [] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP MASTERCHEF",
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
    expect(transactionScore).toStrictEqual(masterchefScore);
    //#endregion
  });
});
