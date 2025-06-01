import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_swap_tx";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { bf, lucid } from "../../../src/util/_";

describe("minswap_swap_tx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped 1,234.56789 ADA for 1,234,567.89 ELEMENT on Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped 1,234.56789 ADA for 1,234,567.89 ELEMENT on Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
        type: "amm_dex",
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: 1 - Unrelated LPs", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped 1,234.56789 ADA for 1,234,567.89 ELEMENT on Minswap",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
                {
                  currency: "XXX/YYY LP",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr2userScriptScript",
              total: [
                {
                  currency: "XXX/YYY LP",
                  amount: 1234567890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: 0 - Unexpected Datum", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "undefined",
      description: "Unknown Activity",
      score: 0,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
        description: "Unknown Activity",
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: .5 - Unexpected Datum", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped for 1,234,567.89 ELEMENT on Minswap",
      score: .5,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: 0,
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
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: .1 - Unexpected Datum", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped tokens on Minswap",
      score: .1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
        description: "Unknown Activity",
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
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
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "0",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: .5 - Unexpected User Accounts", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped 1,234.56789 ADA on Minswap",
      score: .5,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
        description: "Unknown Activity",
        accounts: {
          user: [
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: 1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ELEMENT",
                  amount: -1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: .7 - Unexpected Withdrawal", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Swapped 1,234.56789 ADA for 1,234,567.89 ELEMENT on Minswap",
      score: .7,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        withdrawal_amount: {
          currency: "ADA",
          amount: 123.4567890,
        } as Asset,
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: 0 - Lucid Error", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "undefined",
      description: "Unknown Activity",
      score: 0,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        throw address;
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
              {},
              {},
              {},
              {},
              {
                fields: [
                  {},
                  {
                    fields: [
                      {
                        int: parseInt(hash),
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
        description: "Unknown Activity",
        accounts: {
          user: [
            {
              address: "Ddzaddr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "Ddzaddr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });

  it("score: 0 - Blockfrost Error", async () => {
    //#region Arrange
    const swapTxScore: TransactionScore = {
      type: "undefined",
      description: "Unknown Activity",
      score: 0,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "getAddressDetails").mockImplementation(
      async (address: string): Promise<AddressDetails> => {
        return {
          address: {
            bech32: address,
            hex: address,
          },
          networkId: 1,
          type: "Base",
          paymentCredential: {
            hash: address,
            type:
              address.endsWith("KeyKey") ||
                address.endsWith("KeyScript")
                ? "Key"
                : "Script",
          },
          stakeCredential: {
            hash: address,
            type:
              address.endsWith("ScriptKey") ||
                address.endsWith("ScriptScript")
                ? "Script"
                : "Key",
          },
        };
      }
    );
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        throw hash;
      },
    );
    const transactionScore = await score(
      {
        type: `${undefined}`,
        description: "Unknown Activity",
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ELEMENT",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP ORDER EXECUTED",
            ],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          address: "addr1userScriptScript",
          data_hash: "1234567890",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(swapTxScore);
    //#endregion
  });
});
