import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/multi_stake_delegation";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("multi_stake_delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: 1,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: -.1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: -.2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: -.3,
              }] as Asset[],
            },
          ] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "6862",
          json_metadata: {
            pools: "1234567890".split(""),
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 10,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });

  it("score: .8 - Unexpected User Amounts", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: .8,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: .1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: .2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: .3,
              }] as Asset[],
            },
          ] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "6862",
          json_metadata: {
            pools: "1234567890".split(""),
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 10,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });

  it("score: .85 - Unexpected Other Account", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: .85,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: -.1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: -.2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: -.3,
              }] as Asset[],
            },
          ] as Account[],
          other: [{
            role: "Unknown Address",
          }] as Account[],
        },
        metadata: [{
          label: "6862",
          json_metadata: {
            pools: "1234567890".split(""),
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 10,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });

  it("score: .7 - No Metadata", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: .7,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: -.1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: -.2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: -.3,
              }] as Asset[],
            },
          ] as Account[],
          other: [] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 10,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });

  it("score: .7 - Unexpected Metadata Label", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: .7,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: -.1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: -.2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: -.3,
              }] as Asset[],
            },
          ] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "",
          json_metadata: {
            pools: [],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 10,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });

  it("score: .7 - Unexpected Metadata JSON", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: .7,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: -.1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: -.2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: -.3,
              }] as Asset[],
            },
          ] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "6862",
          json_metadata: {
            pools: [],
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 10,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });

  it("score: .35 - No DelegationCount", async () => {
    //#region Arrange
    const multiStakeDelegationScore: TransactionScore = {
      type: "multi_stake_delegation",
      description: "Delegated stake to multiple pools",
      score: .35,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [
            {
              address: "addr1userKeyStake1",
              total: [{
                currency: "ADA",
                amount: -.1,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake2",
              total: [{
                currency: "ADA",
                amount: -.2,
              }] as Asset[],
            },
            {
              address: "addr1userKeyStake3",
              total: [{
                currency: "ADA",
                amount: -.3,
              }] as Asset[],
            },
          ] as Account[],
          other: [] as Account[],
        },
        metadata: [{
          label: "6862",
          json_metadata: {
            pools: "1234567890".split(""),
          },
        }] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {
        stakeCredential: {
          type: "Key",
          hash: "stake1userKey",
        },
      } as AddressDetails,
      {
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(multiStakeDelegationScore);
    //#endregion
  });
});
