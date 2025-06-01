import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_withdraw_liquidity";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("minswap_withdraw_liquidity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const withdrawLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Withdrew 1,234,567,890 ADA/MIN LP from Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [{
              currency: "ADA/MIN LP",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Minswap Yield Farming",
            total: [{
              currency: "ADA/MIN LP",
              amount: -1234567890,
            }] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP WITHDRAW LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(withdrawLiquidityScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const withdrawLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Withdrew 1,234,567,890 ADA/MIN LP from Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [{
              currency: "ADA/MIN LP",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Minswap Yield Farming",
            total: [{
              currency: "ADA/MIN LP",
              amount: -1234567890,
            }] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP WITHDRAW LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(withdrawLiquidityScore);
    //#endregion
  });

  it("score: .2 - Invalid Conditions", async () => {
    //#region Arrange
    const withdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Withdrew liquidity from Minswap",
      score: .2,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [{
              currency: "ADA/MIN LP",
              amount: -1234567890,
            }] as Asset[],
          }] as Account[],
          other: [{
            role: "Minswap Yield Farming",
            total: [{
              currency: "ADA/MIN LP",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP WITHDRAW LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(withdrawLiquidityScore);
    //#endregion
  });


  it("score: .6 - No LP Token", async () => {
    //#region Arrange
    const withdrawLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Withdrew liquidity from Minswap",
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
                amount: -1.234567,
              },
              {
                currency: "asset",
                amount: 1,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            role: "Minswap Yield Farming",
            total: [{
              currency: "ADA/MIN LP",
              amount: -1234567890,
            }] as Asset[],
          }] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP WITHDRAW LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(withdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - No User Account", async () => {
    //#region Arrange
    const withdrawLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Withdrew liquidity from Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [] as Account[],
          other: [
            {
              address: "addr0otherAddress",
              role: "Unknown Address",
            },
            {
              address: "addr1minswapYieldFarming",
              role: "Minswap Yield Farming",
              total: [
                {
                  currency: "ADA",
                  amount: 1.234567,
                },
                {
                  currency: "asset100000000000000000000000000000000000044",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr2otherAddress",
              role: "Unknown Script",
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP WITHDRAW LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(withdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - No Other Account", async () => {
    //#region Arrange
    const withdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Withdrew 1,234,567,890 ADA/MIN LP from Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            total: [{
              currency: "ADA/MIN LP",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP WITHDRAW LIQUIDITY",
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
    expect(transactionScore).toStrictEqual(withdrawLiquidityScore);
    //#endregion
  });
});
