import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/token_minting";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";
import { bf } from "../../../src/util/_";

describe("token_minting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const tokenMintingScore: TransactionScore = {
      type: "token_minting",
      description: "Token minted 1 NFTa and burned 1 NFTb",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getAssetInfo").mockImplementation(
      async (unit: string): Promise<bf.AssetInfo> => {
        return {
          metadata: {
            name: unit,
            decimals: 0,
          },
          onchain_metadata: {
            name: unit,
            decimals: 0,
          },
          fingerprint: unit,
        } as bf.AssetInfo;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: .123456,
              },
              {
                currency: "NFTa",
                amount: 1,
              },
              {
                currency: "NFTb",
                amount: -1,
              },
            ] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "123456",
            },
            {
              unit: "NFTb",
              quantity: "1",
            },
          ],
        }],
        outputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "654321",
            },
            {
              unit: "Other Token",
              quantity: "0",
            },
            {
              unit: "NFTa",
              quantity: "1",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(tokenMintingScore);
    //#endregion
  });

  it("score: 1 - Unexpected AssetInfo", async () => {
    //#region Arrange
    const tokenMintingScore: TransactionScore = {
      type: "token_minting",
      description: "Token minted 1 NFTa and burned 1 NFTb",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getAssetInfo").mockImplementation(
      async (unit: string): Promise<bf.AssetInfo> => {
        return {
          // metadata: {
          //   name: unit,
          //   decimals: 0,
          // },
          // onchain_metadata: {
          //   name: unit,
          //   decimals: 0,
          // },
          // fingerprint: unit,
        } as bf.AssetInfo;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: .123456,
              },
              {
                currency: "NFTa",
                amount: 1,
              },
              {
                currency: "NFTb",
                amount: -1,
              },
            ] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "123456",
            },
            {
              unit: "NFTb",
              quantity: "1",
            },
          ],
        }],
        outputs: [{
          amount: [
            {
              unit: "NFTa",
              quantity: "1",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(tokenMintingScore);
    //#endregion
  });

  it("score: 1 - Fingerprint", async () => {
    //#region Arrange
    const tokenMintingScore: TransactionScore = {
      type: "token_minting",
      description: "Token minted 1 NFTa and burned 1 NFTb",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getAssetInfo").mockImplementation(
      async (unit: string): Promise<bf.AssetInfo> => {
        return {
          // metadata: {
          //   name: unit,
          //   decimals: 0,
          // },
          // onchain_metadata: {
          //   name: unit,
          //   decimals: 0,
          // },
          fingerprint: unit,
        } as bf.AssetInfo;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: .123456,
              },
              {
                currency: "NFTa",
                amount: 1,
              },
              {
                currency: "NFTb",
                amount: -1,
              },
            ] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "123456",
            },
            {
              unit: "NFTb",
              quantity: "1",
            },
          ],
        }],
        outputs: [{
          amount: [
            {
              unit: "NFTa",
              quantity: "1",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(tokenMintingScore);
    //#endregion
  });

  it("score: 1 - Onchain Metadata", async () => {
    //#region Arrange
    const tokenMintingScore: TransactionScore = {
      type: "token_minting",
      description: "Token minted 1 NFTa and burned 1 NFTb",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getAssetInfo").mockImplementation(
      async (unit: string): Promise<bf.AssetInfo> => {
        return {
          // metadata: {
          //   name: unit,
          //   decimals: 0,
          // },
          onchain_metadata: {
            name: unit,
            decimals: 0,
          },
          fingerprint: unit,
        } as bf.AssetInfo;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: .123456,
              },
              {
                currency: "NFTa",
                amount: 1,
              },
              {
                currency: "NFTb",
                amount: -1,
              },
            ] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "123456",
            },
            {
              unit: "NFTb",
              quantity: "1",
            },
          ],
        }],
        outputs: [{
          amount: [
            {
              unit: "NFTa",
              quantity: "1",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(tokenMintingScore);
    //#endregion
  });

  it("score: 1 - No Metadata Decimals", async () => {
    //#region Arrange
    const tokenMintingScore: TransactionScore = {
      type: "token_minting",
      description: "Token minted 1 NFTa and burned 1 NFTb",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getAssetInfo").mockImplementation(
      async (unit: string): Promise<bf.AssetInfo> => {
        return {
          metadata: {
            name: unit,
            // decimals: 0,
          },
          onchain_metadata: {
            name: unit,
            decimals: 0,
          },
          fingerprint: unit,
        } as bf.AssetInfo;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [
              {
                currency: "ADA",
                amount: .123456,
              },
              {
                currency: "NFTa",
                amount: 1,
              },
              {
                currency: "NFTb",
                amount: -1,
              },
            ] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "123456",
            },
            {
              unit: "NFTb",
              quantity: "1",
            },
          ],
        }],
        outputs: [{
          amount: [
            {
              unit: "NFTa",
              quantity: "1",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(tokenMintingScore);
    //#endregion
  });

  it("score: 0 - Unexpected User Account", async () => {
    //#region Arrange
    const tokenMintingScore: TransactionScore = {
      type: "token_minting",
      description: "Token Minting/Burning",
      score: 0,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getAssetInfo").mockImplementation(
      async (unit: string): Promise<bf.AssetInfo> => {
        return {
          metadata: {
            name: unit,
            decimals: 0,
          },
          onchain_metadata: {
            name: unit,
            decimals: 0,
          },
          fingerprint: unit,
        } as bf.AssetInfo;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {} as TransactionInfo,
      {
        inputs: [{
          amount: [
            {
              unit: "lovelace",
              quantity: "123456",
            },
            {
              unit: "NFTb",
              quantity: "1",
            },
          ],
        }],
        outputs: [{
          amount: [
            {
              unit: "NFTa",
              quantity: "1",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(tokenMintingScore);
    //#endregion
  });
});
