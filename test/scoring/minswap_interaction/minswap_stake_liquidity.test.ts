import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_stake_liquidity";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { bf, lucid } from "../../../src/util/_";

describe("minswap_stake_liquidity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Staked ELEMENT on Minswap",
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
          user: [{
            total: [
              {
                currency: "ADA",
                amount: -1.234567890,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            address: "addr1minswapYieldFarming",
            role: "Minswap Yield Farming",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
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
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });

  it("score: .6 - No LP Token", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "yield_farming",
      description: "Staked ELEMENT on Minswap",
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
          other: [{
            address: "addr1minswapYieldFarming",
            role: "Minswap Yield Farming",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
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
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });

  it("score: .6 - No Other Account", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Staked liquidity on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });

  it("score: .6 - No MinswapYieldFarming Address", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Staked liquidity on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            address: "addr1unknownScript",
            role: "Unknown Script",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
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
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });

  it("score: .6 - No Datum", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Staked liquidity on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            address: "addr1minswapYieldFarming",
            role: "Minswap Yield Farming",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
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
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });

  it("score: .6 - Unexpected Datum", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Staked liquidity on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            address: "addr1minswapYieldFarming",
            role: "Minswap Yield Farming",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
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
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });

  it("score: .6 - Blockfrost Error", async () => {
    //#region Arrange
    const stakeLiquidityScore: TransactionScore = {
      type: "undefined",
      description: "Staked liquidity on Minswap",
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
                amount: -1.234567890,
              },
              {
                currency: "asset100000000000000000000000000000000000044",
                amount: -1234567890,
              },
            ] as Asset[],
          }] as Account[],
          other: [{
            address: "addr1minswapYieldFarming",
            role: "Minswap Yield Farming",
            total: [
              {
                currency: "ADA",
                amount: 1.234567890,
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
              "MINSWAP STAKE LIQUIDITY",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1minswapYieldFarming",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeLiquidityScore);
    //#endregion
  });
});
