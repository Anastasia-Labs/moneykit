import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionScore } from "../../../src/types/_";
import { score } from "../../../src/scoring/non_script_interaction/stake_registration";
import { Account, Asset, Transaction } from "../../../src/types/manifest";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../../../src/util/blockfrost";
import { AddressDetails } from "@lucid-evolution/lucid";

describe("stake_registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("score: 1", async () => {
    //#region Arrange
    const stakeRegistrationScore: TransactionScore = {
      type: "stake_registration",
      description: "Stake Registration",
      score: 1,
    };
    //#endregion

    //#region Act
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
      {} as AddressDetails,
      {
        stake_cert_count: 1,
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeRegistrationScore);
    //#endregion
  });

  it("score: .5 - Unexpected Blockfrost TxInfo", async () => {
    //#region Arrange
    const stakeRegistrationScore: TransactionScore = {
      type: "stake_registration",
      description: "Stake Registration",
      score: .5,
    };
    //#endregion

    //#region Act
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
      {} as AddressDetails,
      {
        stake_cert_count: 0,
        delegation_count: 1,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeRegistrationScore);
    //#endregion
  });

  it("score: .7 - Unexpected User ADA", async () => {
    //#region Arrange
    const stakeRegistrationScore: TransactionScore = {
      type: "stake_registration",
      description: "Stake Registration",
      score: .7,
    };
    //#endregion

    //#region Act
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
      {} as AddressDetails,
      {
        stake_cert_count: 1,
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeRegistrationScore);
    //#endregion
  });

  it("score: .85 - Unexpected Other Accounts", async () => {
    //#region Arrange
    const stakeRegistrationScore: TransactionScore = {
      type: "stake_registration",
      description: "Stake Registration",
      score: .85,
    };
    //#endregion

    //#region Act
    const transactionScore = await score(
      {
        accounts: {
          user: [{
            total: [{
              currency: "ADA",
              amount: -.1234567890,
            }] as Asset[],
          }] as Account[],
          other: [{}] as Account[],
        },
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {
        stake_cert_count: 1,
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeRegistrationScore);
    //#endregion
  });

  it("score: .9 - Unlikely Withdrawal", async () => {
    //#region Arrange
    const stakeRegistrationScore: TransactionScore = {
      type: "stake_registration",
      description: "Stake Registration",
      score: .9,
    };
    //#endregion

    //#region Act
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
        withdrawal_amount: {
          currency: "ADA",
          amount: .1234567890,
        } as Asset,
        metadata: [] as Record<string, any>[],
      } as unknown as Transaction,
      {} as AddressInfo,
      {} as AddressDetails,
      {
        stake_cert_count: 1,
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeRegistrationScore);
    //#endregion
  });

  it("score: .95 - Arbitrary Metadata", async () => {
    //#region Arrange
    const stakeRegistrationScore: TransactionScore = {
      type: "stake_registration",
      description: "Stake Registration",
      score: .95,
    };
    //#endregion

    //#region Act
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
      {} as AddressDetails,
      {
        stake_cert_count: 1,
        delegation_count: 0,
      } as TransactionInfo,
      {} as TransactionUTXOs,
    );
    //#endregion

    //#region Assert
    expect(transactionScore).toStrictEqual(stakeRegistrationScore);
    //#endregion
  });
});
