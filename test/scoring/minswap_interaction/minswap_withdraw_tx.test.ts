import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_withdraw_tx";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { lucid } from "../../../src/util/_";

describe("minswap_withdraw_tx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,232.56789 ADA and 1,234,567.89 Minswap from ADA-MIN pool on Minswap",
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
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA-MIN LP",
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
                  currency: "Minswap",
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,232.56789 ADA and 1,234,567.89 Minswap from ADA-MIN pool on Minswap",
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
    const transactionScore = await score(
      {
        type: "amm_dex",
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA-MIN LP",
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
                  currency: "Minswap",
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: 1 - Has Unrelated LP Token", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,232.56789 ADA and 1,234,567.89 Minswap from ADA-MIN pool on Minswap",
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
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA-MIN LP",
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
                  currency: "Minswap",
                  amount: 1234567.890,
                },
                {
                  currency: "ADA-ELEMENT LP",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr2userScriptScript",
              total: [{
                currency: "ADA-ELEMENT LP",
                amount: 1234567890,
              }] as Asset[],
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: .1 - Unexpected User Account", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew from Minswap",
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
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            address: "addr1userScriptScript",
            total: [
              {
                currency: " LP",
                amount: -1234567890,
              },
            ] as Asset[],
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: .5 - Unexpected PoolName", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,232.56789 ADA and 1,234,567.89 Minswap from Minswap",
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
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: " LP",
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
                  currency: "Minswap",
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: .2 - Unexpected User Accounts", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew from ADA-MIN pool on Minswap",
      score: .2,
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
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [{
            address: "addr1userScriptScript",
            total: [
              {
                currency: "ADA-MIN LP",
                amount: -1234567890,
              },
            ] as Asset[],
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: .7 - Unexpected Withdrawal", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
      type: "amm_dex",
      description: "Withdrew 1,232.56789 ADA and 1,234,567.89 Minswap from ADA-MIN pool on Minswap",
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
    const transactionScore = await score(
      {
        type: `${undefined}`,
        accounts: {
          user: [
            {
              address: "addr1userScriptScript",
              total: [
                {
                  currency: "ADA-MIN LP",
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
                  currency: "Minswap",
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });

  it("score: 0 - Lucid Error", async () => {
    //#region Arrange
    const withdrawtxScore: TransactionScore = {
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
                  currency: "ADA-MIN LP",
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
                  currency: "Minswap",
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
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(withdrawtxScore);
    //#endregion
  });
});
