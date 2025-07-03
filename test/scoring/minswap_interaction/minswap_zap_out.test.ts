import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_zap_out";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { bf, lucid } from "../../../src/util/_";

describe("minswap_zap_out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const zapOutScore: TransactionScore = {
      type: "amm_dex",
      description: "Zapped-out 1,234,567,890 ELEMENT LP Tokens for 1,232.56789 ADA and 1,234,567.89 ELEMENT on Minswap",
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
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
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
        };
      }
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
                  currency: "asset100000000000000000000000000000000000044",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
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
            },
          ] as Account[],
          other: [{
            address: "addr1scriptAddress",
            role: "Unknown Script",
            total: [{
              currency: "asset100000000000000000000000000000000000044",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
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
        outputs: [{
          address: "addr1scriptAddress",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(zapOutScore);
    //#endregion
  });

  it("score: 0 - Lucid.getAddressDetails Error", async () => {
    //#region Arrange
    const zapOutScore: TransactionScore = {
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
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
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
        };
      }
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
                  currency: "asset100000000000000000000000000000000000044",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "Ddzaddr1userKeyKey",
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
            },
          ] as Account[],
          other: [{
            address: "Ddzaddr1scriptAddress",
            role: "Unknown Script",
            total: [{
              currency: "asset100000000000000000000000000000000000044",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
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
        outputs: [{
          address: "Ddzaddr1scriptAddress",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(zapOutScore);
    //#endregion
  });

  it("score: 1 - Lucid.toText Error", async () => {
    //#region Arrange
    const zapOutScore: TransactionScore = {
      type: "amm_dex",
      description: "Zapped-out 1,234,567,890 undefined LP Tokens for 1,232.56789 ADA and 1,234,567.89 ELEMENT on Minswap",
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
    vi.spyOn(lucid, "toText").mockImplementation(
      async (hex: string): Promise<string> => {
        throw hex;
      });
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        return {
          json_value: {
            fields: [
              {},
              {},
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
        };
      }
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
                  currency: "asset100000000000000000000000000000000000044",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
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
            },
          ] as Account[],
          other: [{
            address: "addr1scriptAddress",
            role: "Unknown Script",
            total: [{
              currency: "asset100000000000000000000000000000000000044",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
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
        outputs: [{
          address: "addr1scriptAddress",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(zapOutScore);
    //#endregion
  });

  it("score: .7 - Blockfrost Error", async () => {
    //#region Arrange
    const zapOutScore: TransactionScore = {
      type: "amm_dex",
      description: "Zapped-out 1,234,567,890 undefined LP Tokens for 1,232.56789 ADA and 1,234,567.89 ELEMENT on Minswap",
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
    vi.spyOn(lucid, "toText")
      .mockImplementation(async (hex: string): Promise<string> => hex);
    vi.spyOn(bf, "getDatum").mockImplementation(
      async (hash: string): Promise<bf.ScriptDatum> => {
        throw hash;
      }
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
                  currency: "asset100000000000000000000000000000000000044",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
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
            },
          ] as Account[],
          other: [{
            address: "addr1scriptAddress",
            role: "Unknown Script",
            total: [{
              currency: "asset100000000000000000000000000000000000044",
              amount: 1234567890,
            }] as Asset[],
          }] as Account[],
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
        outputs: [{
          address: "addr1scriptAddress",
          data_hash: "ELEMENT",
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(zapOutScore);
    //#endregion
  });
});
