import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_stake_min";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("minswap_stake_min", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const stakeMinScore: TransactionScore = {
      type: "amm_dex",
      description: "Staked 1,234.56789 MIN on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "Minswap",
                amount: -1234.567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Minswap MIN Staking",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
              },
              {
                currency: "Minswap",
                amount: 1234.567890,
              },
            ] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP STAKE MIN",
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
    expect(transactionScore).toStrictEqual(stakeMinScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const stakeMinScore: TransactionScore = {
      type: "amm_dex",
      description: "Staked 1,234.56789 MIN on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "Minswap",
                amount: -1234.567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Minswap MIN Staking",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
              },
              {
                currency: "Minswap",
                amount: 1234.567890,
              },
            ] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP STAKE MIN",
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
    expect(transactionScore).toStrictEqual(stakeMinScore);
    //#endregion
  });

  it("score: .6 - No MIN Token", async () => {
    //#region Arrange
    const stakeMinScore: TransactionScore = {
      type: "amm_dex",
      description: "Staked MIN on Minswap",
      score: .6,
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
                amount: -1.234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [
            {
              role: "Minswap MIN Staking",
              total: [
                {
                  currency: "ADA",
                  amount: 1.234567890,
                },
                {
                  currency: "Minswap",
                  amount: 1234.567890,
                },
              ] as Asset[],
            },
            {
              role: "Unknown Script",
              total: [
                {
                  currency: "Minswap",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP STAKE MIN",
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
    expect(transactionScore).toStrictEqual(stakeMinScore);
    //#endregion
  });

  it("score: .6 - No MinswapMinStaking Address", async () => {
    //#region Arrange
    const stakeMinScore: TransactionScore = {
      type: "amm_dex",
      description: "Staked 1,234.56789 MIN on Minswap",
      score: .6,
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
                amount: 1.234567890,
              },
              {
                currency: "Minswap",
                amount: -1234.567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Unknown Address",
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "Minswap",
                amount: 1234.567890,
              },
            ] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP STAKE MIN",
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
    expect(transactionScore).toStrictEqual(stakeMinScore);
    //#endregion
  });
});
