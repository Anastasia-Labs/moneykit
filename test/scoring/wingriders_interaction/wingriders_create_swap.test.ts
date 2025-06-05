import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/wingriders_interaction/wingriders_create_swap";
import { Account, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { lucid } from "../../../src/util/_";

describe("wingriders_create_swap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const createSwap: TransactionScore = {
      type: "amm_dex",
      description: "Created a swap transaction on Wingriders",
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
                  amount: 5,
                },
                {
                  currency: "WR-LPT-Xx/Yy",
                  amount: -55555,
                },
              ],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -5,
                },
                {
                  currency: "WR-LPT-Xx/Yy",
                  amount: 55555,
                },
              ],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS SWAP",
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
    expect(transactionScore).toStrictEqual(createSwap);
    //#endregion
  });

  it("score: 1 - Predefined Type", async () => {
    //#region Arrange
    const createSwap: TransactionScore = {
      type: "amm_dex",
      description: "Created a swap transaction on Wingriders",
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
                  amount: 5,
                },
                {
                  currency: "WR-LPT-Xx/Yy",
                  amount: -55555,
                },
              ],
            },
            {
              address: "addr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -5,
                },
                {
                  currency: "WR-LPT-Xx/Yy",
                  amount: 55555,
                },
              ],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS SWAP",
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
    expect(transactionScore).toStrictEqual(createSwap);
    //#endregion
  });

  it("score: .25", async () => {
    //#region Arrange
    const createSwap: TransactionScore = {
      type: "amm_dex",
      description: "Created a swap transaction on Wingriders",
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
                  amount: 5,
                },
                {
                  currency: "WR-LPT-Xx/Yy",
                  amount: -55555,
                },
              ],
            },
            {
              address: "Ddzaddr1userKeyKey",
              total: [
                {
                  currency: "ADA",
                  amount: -5,
                },
                {
                  currency: "WR-LPT-Xx/Yy",
                  amount: 55555,
                },
              ],
            },
          ] as Account[],
        },
        metadata: [{
          label: "674",
          json_metadata: {
            msg: [
              "WINGRIDERS SWAP",
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
    expect(transactionScore).toStrictEqual(createSwap);
    //#endregion
  });
});
