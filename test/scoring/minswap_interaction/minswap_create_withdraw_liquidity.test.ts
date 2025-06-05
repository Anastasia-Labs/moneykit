import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_create_withdraw_liquidity";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { bf, lucid } from "../../../src/util/_";

describe("minswap_create_withdraw_liquidity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Created a withdraw 1,234,567,890 LP Tokens from ELEMENT farm on Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {
                list: [
                  {
                    fields: [
                      {
                        fields: [
                          {},
                          {
                            bytes: hash,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
      },
    );
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              total: [
                {
                  currency: "ADA",
                  amount: -1.234567,
                },
                {
                  currency: "asset100000000000000000000000000000000000044",
                  amount: 1234567890,
                },
              ] as Asset[],
            },
          ] as Account[],
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
      {
        inputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - No LP Token", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Created a withdraw liquidity order on Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {
                list: [
                  {
                    fields: [
                      {
                        fields: [
                          {},
                          {
                            bytes: hash,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
      },
    );
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
      {
        inputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - No Other Account", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Created a withdraw liquidity order on Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              total: [
                {
                  currency: "ADA",
                  amount: -1.234567,
                },
                {
                  currency: "asset100000000000000000000000000000000000044",
                  amount: 1234567890,
                },
              ] as Asset[],
            },
          ] as Account[],
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
      {
        inputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - No MinswapYieldFarming Address", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Created a withdraw liquidity order on Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              total: [
                {
                  currency: "ADA",
                  amount: -1.234567,
                },
                {
                  currency: "asset100000000000000000000000000000000000044",
                  amount: 1234567890,
                },
              ] as Asset[],
            },
          ] as Account[],
          other: [{
            address: "addr1unknownScript",
            role: "Unknown Script",
            total: [
              {
                currency: "ADA",
                amount: -1.234567,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: 1234567890,
              },
            ] as Asset[],
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
      {
        inputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - No Datum", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Created a withdraw liquidity order on Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {
                list: [
                  {
                    fields: [
                      {
                        fields: [
                          {},
                          {
                            bytes: hash,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
      },
    );
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
                currency: "asset100000000000000000000000000000000000044",
                amount: 1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
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
      {
        inputs: [
          {
            address: "addr1minswapYieldFarming",
            data_hash: "",
          },
        ],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - Unexpected Datum", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Created a withdraw liquidity order on Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {
                list: [
                  {
                    fields: [
                      {
                        fields: [
                          {},
                          {
                            bytes: "",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
      },
    );
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
                currency: "asset100000000000000000000000000000000000044",
                amount: 1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
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
      {
        inputs: [
          {
            address: "addr1minswapYieldFarming",
            data_hash: "ELEMENT",
          },
        ],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });

  it("score: .6 - Blockfrost Error", async () => {
    //#region Arrange
    const createWithdrawLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Created a withdraw liquidity order on Minswap",
      score: .6,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        throw hash;
      },
    );
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
                currency: "asset100000000000000000000000000000000000044",
                amount: 1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
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
      {
        inputs: [
          {
            address: "addr1minswapYieldFarming",
            data_hash: "Internal Server Error",
          },
        ],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(createWithdrawLiquidityScore);
    //#endregion
  });
});
