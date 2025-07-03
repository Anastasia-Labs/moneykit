import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/minswap_interaction/minswap_create_deposit_tx";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { lucid } from "../../../src/util/_";

describe("minswap_create_deposit_tx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const createDepositTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a deposit order of ADA and MIN on Minswap",
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
                  currency: "ADA",
                  amount: 1234.567890,
                },
                {
                  currency: "MIN",
                  amount: 1234567.890,
                },
              ],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "MIN",
                  amount: -1234567.890,
                },
              ],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP DEPOSIT ORDER",
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
    expect(transactionScore).toStrictEqual(createDepositTxScore);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const createDepositTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a deposit order of ADA and MIN on Minswap",
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
                  currency: "ADA",
                  amount: 1234.567890,
                },
                {
                  currency: "MIN",
                  amount: 1234567.890,
                },
              ],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "MIN",
                  amount: -1234567.890,
                },
              ],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP DEPOSIT ORDER",
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
    expect(transactionScore).toStrictEqual(createDepositTxScore);
    //#endregion
  });

  it("score: 1 - Unrelated LP", async () => {
    //#region Arrange
    const createDepositTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a deposit order of ADA and MIN on Minswap",
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
                  currency: "ADA",
                  amount: 1234.567890,
                },
                {
                  currency: "MIN",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "MIN",
                  amount: -1234567.890,
                },
                {
                  currency: "XXX/YYY LP",
                  amount: 1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr2userScriptScript",
              total: [
                {
                  currency: "XXX/YYY LP",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP DEPOSIT ORDER",
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
    expect(transactionScore).toStrictEqual(createDepositTxScore);
    //#endregion
  });

  it("score: 1 - Deposit NonADA", async () => {
    //#region Arrange
    const createDepositTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a deposit order of MIN and ELEMENT on Minswap",
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
                  currency: "ADA",
                  amount: 1.234567,
                },
                {
                  currency: "MIN",
                  amount: 1234567.890,
                },
                {
                  currency: "ELEMENT",
                  amount: 1234567890,
                },
              ] as Asset[],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -1.234567,
                },
                {
                  currency: "MIN",
                  amount: -1234567.890,
                },
                {
                  currency: "ELEMENT",
                  amount: -1234567890,
                },
              ] as Asset[],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "MINSWAP DEPOSIT ORDER",
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
    expect(transactionScore).toStrictEqual(createDepositTxScore);
    //#endregion
  });

  it("score: .25", async () => {
    //#region Arrange
    const createDepositTxScore: TransactionScore = {
      type: "amm_dex",
      description: "Created a deposit order on Minswap",
      score: .25,
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
        accounts: {
          user: [
            {
              address: "Ddzaddr1userScriptScript",
              total: [
                {
                  currency: "ADA",
                  amount: 1234.567890,
                },
                {
                  currency: "MIN",
                  amount: 1234567.890,
                },
              ] as Asset[],
            },
            {
              address: "Ddzaddr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -1234.567890,
                },
                {
                  currency: "MIN",
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
              "MINSWAP DEPOSIT ORDER",
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
    expect(transactionScore).toStrictEqual(createDepositTxScore);
    //#endregion
  });
});
