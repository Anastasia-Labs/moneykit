import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/setup_collateral";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails, Credential } from "@lucid-evolution/lucid";
import { lucid } from "../../../src/util/_";

describe("setup_collateral", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1userKeyKey",
          amount: [{
            unit: "lovelace",
            quantity: "5000000",
          }],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });

  it("score: 1 - Arbitrary Other Tokens", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1userKeyKey",
          amount: [
            {
              unit: "asset1nft",
              quantity: "1",
            },
            {
              unit: "lovelace",
              quantity: "5000000",
            },
          ],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });

  it("score: .55 - Unexpected User ADA", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: .55,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -1.234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1userKeyKey",
          amount: [{
            unit: "lovelace",
            quantity: "5000000",
          }],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: .95,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [{}] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1userKeyKey",
          amount: [{
            unit: "lovelace",
            quantity: "5000000",
          }],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });

  it("score: .5 - Mismatch Credentials", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: .5,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr2userKeyKey",
          amount: [{
            unit: "lovelace",
            quantity: "5000000",
          }],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });

  it("score: .5 - Lucid Error", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: .5,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        throw address;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        throw address;
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [{
          address: "addr1userKeyKey",
          amount: [{
            unit: "lovelace",
            quantity: "5000000",
          }],
        }],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });

  it("score: .5 - Unexpected Blockfrost TxUTXOs", async () => {
    //#region Arrange
    const setupCollateralScore: TransactionScore = {
      type: "setup_collateral",
      description: "Setup Collateral",
      score: .5,
    };
    //#endregion

    //#region Act
    vi.spyOn(lucid, "paymentCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: address,
          type: "Key",
        };
      }
    );
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        network_fee: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1userKeyKey",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1userKeyKey",
          type: "Key",
        },
      } as AddressDetails,
      {} as TransactionInfo,
      {
        outputs: [] as Record<string, any>[],
      } as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(setupCollateralScore);
    //#endregion
  });
});
