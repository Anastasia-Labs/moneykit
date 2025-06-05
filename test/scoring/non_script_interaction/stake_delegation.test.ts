import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/stake_delegation";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, PoolMetadata, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails, Credential } from "@lucid-evolution/lucid";
import { bf, lucid } from "../../../src/util/_";

describe("stake_delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Delegated stake to pool: [POOL] PoolName",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "addr1user",
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
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: 1 - Incomplete Pool Metadata", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Delegated stake to pool: PoolName",
      score: 1,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          // ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "addr1user",
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
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: .15 - No Stake Credential", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Stake Delegation",
      score: .15,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "addr1user",
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
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: .58 - Unexpected Stake Address", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Stake Delegation",
      score: .58,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "Unexpected Stake Address",
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
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: .9 - Unexpected User ADA", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Delegated stake to pool: [POOL] PoolName",
      score: .9,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "addr1user",
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
              amount: .1234567890,
            }] as Asset[],
          }] as Account[],
          other: [] as Account[],
        },
        withdrawal_amount: {
          currency: "ADA",
          amount: 1.234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Delegated stake to pool: [POOL] PoolName",
      score: .95,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "addr1user",
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
        metadata: [{}] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: .58 - 0 Delegation Count", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Stake Delegation",
      score: .58,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
      }
    );
    vi.spyOn(lucid, "stakeCredentialOf").mockImplementation(
      async (address: string): Promise<Credential> => {
        return {
          hash: "addr1user",
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
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });

  it("score: .15 - Lucid Error", async () => {
    //#region Arrange
    const stakeDelegationScore: TransactionScore = {
      type: "stake_delegation",
      description: "Stake Delegation",
      score: .15,
    };
    //#endregion

    //#region Act
    vi.spyOn(bf, "getTransactionDelegations").mockImplementation(
      async (hash: string): Promise<bf.TransactionDelegations> => {
        return [{
          address: "addr1user",
          pool_id: "pool1id",
        }] as bf.TransactionDelegations;
      }
    );
    vi.spyOn(bf, "getPoolMetadata").mockImplementation(
      async (id: string): Promise<PoolMetadata> => {
        return {
          ticker: "POOL",
          name: "PoolName",
        } as PoolMetadata;
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
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        address: {
          bech32: "addr1user",
          hex: "0xADDR1USER",
        },
        networkId: 1,
        type: "Base",
        paymentCredential: {
          hash: "addr1user",
          type: "Key",
        },
        stakeCredential: {
          hash: "addr1user",
          type: "Key",
        },
      } as AddressDetails,
      {
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeDelegationScore);
    //#endregion
  });
});
