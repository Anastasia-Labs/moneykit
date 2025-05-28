import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bf, cache } from "../../src/util/_";
import { AddressInfo, AddressTransactions, AssetInfo, PoolMetadata, ScriptDatum, TransactionDelegations, TransactionInfo, TransactionMetadata, TransactionUTXOs, TransactionWithdrawals } from "../../src/util/blockfrost";

const http400 = {
  status: 400,
  statusText: "Bad Request",
  headers: {
    "content-type": "application/json",
  },
};

const http403 = {
  status_code: 403,
  error: "Forbidden",
  message: "Invalid project token.",
};

const http404 = {
  status_code: 404,
  error: "Not Found",
  message: "The requested component has not been found.",
};

const http418 = {
  status_code: 418,
  error: "Requested Banned",
  message: "IP has been auto-banned for flooding.",
};

const http429 = {
  status_code: 429,
  error: "Project Over Limit",
  message: "Usage is over limit.",
};

const http500 = {
  status_code: 500,
  error: "Internal Server Error",
  message: "An unexpected response was received from the backend.",
};

describe("blockfrost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getAddressInfo", async () => {
    //#region Arrange
    const addrCached: AddressInfo = {
      address: "addrCached",
      amount: [
        {
          unit: "lovelace",
          quantity: "42000000"
        },
        {
          unit: "cachedAddressTokens",
          quantity: "12"
        }
      ],
      stake_address: "cachedAddressSKH",
      type: "shelley",
      script: false,
    };
    const addr200: AddressInfo = {
      address: "addr200",
      amount: [
        {
          unit: "lovelace",
          quantity: "200000000"
        },
        {
          unit: "addr200tokens",
          quantity: "200"
        }
      ],
      stake_address: "addr200skh",
      type: "shelley",
      script: false,
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): AddressInfo | undefined => {
        // console.log({ key });
        return key === "bf./addresses/addrCached" ? addrCached : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.endsWith("/addr200"))
          return new Response(
            JSON.stringify(addr200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.endsWith("/addr400"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.endsWith("/addr403"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.endsWith("/addr404"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.endsWith("/addr418"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.endsWith("/addr429"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedAddr = await bf.getAddressInfo("addrCached");
    const okAddr = await bf.getAddressInfo("addr200");
    const badAddr = await bf.getAddressInfo("addr400");
    const forbiddenAddr = await bf.getAddressInfo("addr403");
    const notAddr = await bf.getAddressInfo("addr404");
    const bannedAddr = await bf.getAddressInfo("addr418");
    const overAddr = await bf.getAddressInfo("addr429");
    const errorAddr = await bf.getAddressInfo("addr500");
    //#endregion

    //#region Assert
    expect(cachedAddr).toStrictEqual(addrCached);
    expect(okAddr).toStrictEqual(addr200);
    expect(badAddr).toStrictEqual(http400);
    expect(forbiddenAddr).toStrictEqual(http403);
    expect(notAddr).toStrictEqual(http404);
    expect(bannedAddr).toStrictEqual(http418);
    expect(overAddr).toStrictEqual(http429);
    expect(errorAddr).toStrictEqual(http500);
    //#endregion
  });

  it("getAddressTransactions", async () => {
    //#region Arrange
    const atCache: AddressTransactions[] = [];
    const at200: AddressTransactions[] = [];
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): AddressTransactions[] | undefined => {
        // console.log({ key });
        return key === "bf./addresses/addrCached/transactions?order=desc"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/addr200/"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/addr400/"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/addr403/"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/addr404/"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/addr418/"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/addr429/"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedAddr =
      await bf.getAddressTransactions("addrCached");
    const okAddr =
      await bf.getAddressTransactions("addr200");
    const badAddr =
      await bf.getAddressTransactions("addr400");
    const forbiddenAddr =
      await bf.getAddressTransactions("addr403");
    const notAddr =
      await bf.getAddressTransactions("addr404");
    const bannedAddr =
      await bf.getAddressTransactions("addr418");
    const overAddr =
      await bf.getAddressTransactions("addr429");
    const errorAddr =
      await bf.getAddressTransactions("addr500");
    //#endregion

    //#region Assert
    expect(cachedAddr).toStrictEqual(atCache);
    expect(okAddr).toStrictEqual(at200);
    expect(badAddr).toStrictEqual(http400);
    expect(forbiddenAddr).toStrictEqual(http403);
    expect(notAddr).toStrictEqual(http404);
    expect(bannedAddr).toStrictEqual(http418);
    expect(overAddr).toStrictEqual(http429);
    expect(errorAddr).toStrictEqual(http500);
    //#endregion
  });

  it("getTransactionInfo", async () => {
    //#region Arrange
    const atCache: TransactionInfo = {
      "hash": "hashCached",
      "block": "356b7d7dbb696ccd12775c016941057a9dc70898d87a63fc752271bb46856940",
      "block_height": 123456,
      "block_time": 1635505891,
      "slot": 42000000,
      "index": 1,
      "output_amount": [
        {
          "unit": "lovelace",
          "quantity": "42000000"
        },
        {
          "unit": "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e",
          "quantity": "12"
        }
      ],
      "fees": "182485",
      "deposit": "0",
      "size": 433,
      "invalid_before": null,
      "invalid_hereafter": "13885913",
      "utxo_count": 4,
      "withdrawal_count": 0,
      "mir_cert_count": 0,
      "delegation_count": 0,
      "stake_cert_count": 0,
      "pool_update_count": 0,
      "pool_retire_count": 0,
      "asset_mint_or_burn_count": 0,
      "redeemer_count": 0,
      "valid_contract": true
    };
    const at200: TransactionInfo = {
      "hash": "hash200",
      "block": "356b7d7dbb696ccd12775c016941057a9dc70898d87a63fc752271bb46856940",
      "block_height": 123456,
      "block_time": 1635505891,
      "slot": 42000000,
      "index": 1,
      "output_amount": [
        {
          "unit": "lovelace",
          "quantity": "42000000"
        },
        {
          "unit": "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e",
          "quantity": "12"
        }
      ],
      "fees": "182485",
      "deposit": "0",
      "size": 433,
      "invalid_before": null,
      "invalid_hereafter": "13885913",
      "utxo_count": 4,
      "withdrawal_count": 0,
      "mir_cert_count": 0,
      "delegation_count": 0,
      "stake_cert_count": 0,
      "pool_update_count": 0,
      "pool_retire_count": 0,
      "asset_mint_or_burn_count": 0,
      "redeemer_count": 0,
      "valid_contract": true
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): TransactionInfo | undefined => {
        // console.log({ key });
        return key === "bf./txs/hashCached"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/txs/hash200"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash400"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash403"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash404"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash418"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash429"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedHash =
      await bf.getTransactionInfo("hashCached");
    const okHash =
      await bf.getTransactionInfo("hash200");
    const badHash =
      await bf.getTransactionInfo("hash400");
    const forbiddenHash =
      await bf.getTransactionInfo("hash403");
    const notHash =
      await bf.getTransactionInfo("hash404");
    const bannedHash =
      await bf.getTransactionInfo("hash418");
    const overHash =
      await bf.getTransactionInfo("hash429");
    const errorHash =
      await bf.getTransactionInfo("hash500");
    //#endregion

    //#region Assert
    expect(cachedHash).toStrictEqual(atCache);
    expect(okHash).toStrictEqual(at200);
    expect(badHash).toStrictEqual(http400);
    expect(forbiddenHash).toStrictEqual(http403);
    expect(notHash).toStrictEqual(http404);
    expect(bannedHash).toStrictEqual(http418);
    expect(overHash).toStrictEqual(http429);
    expect(errorHash).toStrictEqual(http500);
    //#endregion
  });

  it("getTransactionUTXOs", async () => {
    //#region Arrange
    const atCache: TransactionUTXOs = {
      hash: "hashCached",
      inputs: [],
      outputs: [],
    };
    const at200: TransactionUTXOs = {
      hash: "hash200",
      inputs: [],
      outputs: [],
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): TransactionUTXOs | undefined => {
        // console.log({ key });
        return key === "bf./txs/hashCached/utxos"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/txs/hash200/utxos"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash400/utxos"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash403/utxos"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash404/utxos"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash418/utxos"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash429/utxos"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedHash =
      await bf.getTransactionUTXOs("hashCached");
    const okHash =
      await bf.getTransactionUTXOs("hash200");
    const badHash =
      await bf.getTransactionUTXOs("hash400");
    const forbiddenHash =
      await bf.getTransactionUTXOs("hash403");
    const notHash =
      await bf.getTransactionUTXOs("hash404");
    const bannedHash =
      await bf.getTransactionUTXOs("hash418");
    const overHash =
      await bf.getTransactionUTXOs("hash429");
    const errorHash =
      await bf.getTransactionUTXOs("hash500");
    //#endregion

    //#region Assert
    expect(cachedHash).toStrictEqual(atCache);
    expect(okHash).toStrictEqual(at200);
    expect(badHash).toStrictEqual(http400);
    expect(forbiddenHash).toStrictEqual(http403);
    expect(notHash).toStrictEqual(http404);
    expect(bannedHash).toStrictEqual(http418);
    expect(overHash).toStrictEqual(http429);
    expect(errorHash).toStrictEqual(http500);
    //#endregion
  });

  it("getTransactionMetadata", async () => {
    //#region Arrange
    const atCache: TransactionMetadata = [];
    const at200: TransactionMetadata = [];
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): TransactionMetadata | undefined => {
        // console.log({ key });
        return key === "bf./txs/hashCached/metadata"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/txs/hash200/metadata"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash400/metadata"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash403/metadata"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash404/metadata"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash418/metadata"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash429/metadata"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedHash =
      await bf.getTransactionMetadata("hashCached");
    const okHash =
      await bf.getTransactionMetadata("hash200");
    const badHash =
      await bf.getTransactionMetadata("hash400");
    const forbiddenHash =
      await bf.getTransactionMetadata("hash403");
    const notHash =
      await bf.getTransactionMetadata("hash404");
    const bannedHash =
      await bf.getTransactionMetadata("hash418");
    const overHash =
      await bf.getTransactionMetadata("hash429");
    const errorHash =
      await bf.getTransactionMetadata("hash500");
    //#endregion

    //#region Assert
    expect(cachedHash).toStrictEqual(atCache);
    expect(okHash).toStrictEqual(at200);
    expect(badHash).toStrictEqual(http400);
    expect(forbiddenHash).toStrictEqual(http403);
    expect(notHash).toStrictEqual(http404);
    expect(bannedHash).toStrictEqual(http418);
    expect(overHash).toStrictEqual(http429);
    expect(errorHash).toStrictEqual(http500);
    //#endregion
  });

  it("getTransactionDelegations", async () => {
    //#region Arrange
    const atCache: TransactionDelegations = [];
    const at200: TransactionDelegations = [];
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): TransactionDelegations | undefined => {
        // console.log({ key });
        return key === "bf./txs/hashCached/delegations"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/txs/hash200/delegations"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash400/delegations"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash403/delegations"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash404/delegations"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash418/delegations"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash429/delegations"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedHash =
      await bf.getTransactionDelegations("hashCached");
    const okHash =
      await bf.getTransactionDelegations("hash200");
    const badHash =
      await bf.getTransactionDelegations("hash400");
    const forbiddenHash =
      await bf.getTransactionDelegations("hash403");
    const notHash =
      await bf.getTransactionDelegations("hash404");
    const bannedHash =
      await bf.getTransactionDelegations("hash418");
    const overHash =
      await bf.getTransactionDelegations("hash429");
    const errorHash =
      await bf.getTransactionDelegations("hash500");
    //#endregion

    //#region Assert
    expect(cachedHash).toStrictEqual(atCache);
    expect(okHash).toStrictEqual(at200);
    expect(badHash).toStrictEqual(http400);
    expect(forbiddenHash).toStrictEqual(http403);
    expect(notHash).toStrictEqual(http404);
    expect(bannedHash).toStrictEqual(http418);
    expect(overHash).toStrictEqual(http429);
    expect(errorHash).toStrictEqual(http500);
    //#endregion
  });

  it("getTransactionWithdrawals", async () => {
    //#region Arrange
    const atCache: TransactionWithdrawals = [];
    const at200: TransactionWithdrawals = [];
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): TransactionWithdrawals | undefined => {
        // console.log({ key });
        return key === "bf./txs/hashCached/withdrawals"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/txs/hash200/withdrawals"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash400/withdrawals"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash403/withdrawals"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash404/withdrawals"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash418/withdrawals"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/txs/hash429/withdrawals"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedHash =
      await bf.getTransactionWithdrawals("hashCached");
    const okHash =
      await bf.getTransactionWithdrawals("hash200");
    const badHash =
      await bf.getTransactionWithdrawals("hash400");
    const forbiddenHash =
      await bf.getTransactionWithdrawals("hash403");
    const notHash =
      await bf.getTransactionWithdrawals("hash404");
    const bannedHash =
      await bf.getTransactionWithdrawals("hash418");
    const overHash =
      await bf.getTransactionWithdrawals("hash429");
    const errorHash =
      await bf.getTransactionWithdrawals("hash500");
    //#endregion

    //#region Assert
    expect(cachedHash).toStrictEqual(atCache);
    expect(okHash).toStrictEqual(at200);
    expect(badHash).toStrictEqual(http400);
    expect(forbiddenHash).toStrictEqual(http403);
    expect(notHash).toStrictEqual(http404);
    expect(bannedHash).toStrictEqual(http418);
    expect(overHash).toStrictEqual(http429);
    expect(errorHash).toStrictEqual(http500);
    //#endregion
  });

  it("getAssetInfo", async () => {
    //#region Arrange
    const atCache: AssetInfo = {
      "asset": "unitCached",
      "policy_id": "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a7",
      "asset_name": "6e7574636f696e",
      "fingerprint": "asset1pkpwyknlvul7az0xx8czhl60pyel45rpje4z8w",
      "quantity": "12000",
      "initial_mint_tx_hash": "6804edf9712d2b619edb6ac86861fe93a730693183a262b165fcc1ba1bc99cad",
      "mint_or_burn_count": 1,
      "onchain_metadata": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      },
      "onchain_metadata_standard": "CIP25v1",
      "onchain_metadata_extra": "…",
      "metadata": {
        "name": "nutcoin",
        "description": "The Nut Coin",
        "ticker": "nutc",
        "url": "https://www.stakenuts.com/",
        "logo": "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",
        "decimals": 6
      }
    };
    const at200: AssetInfo = {
      "asset": "unit200",
      "policy_id": "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a7",
      "asset_name": "6e7574636f696e",
      "fingerprint": "asset1pkpwyknlvul7az0xx8czhl60pyel45rpje4z8w",
      "quantity": "12000",
      "initial_mint_tx_hash": "6804edf9712d2b619edb6ac86861fe93a730693183a262b165fcc1ba1bc99cad",
      "mint_or_burn_count": 1,
      "onchain_metadata": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      },
      "onchain_metadata_standard": "CIP25v1",
      "onchain_metadata_extra": "…",
      "metadata": {
        "name": "nutcoin",
        "description": "The Nut Coin",
        "ticker": "nutc",
        "url": "https://www.stakenuts.com/",
        "logo": "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",
        "decimals": 6
      }
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): AssetInfo | undefined => {
        // console.log({ key });
        return key === "bf./assets/unitCached"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/assets/unit200"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/assets/unit400"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/assets/unit403"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/assets/unit404"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/assets/unit418"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/assets/unit429"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedUnit =
      await bf.getAssetInfo("unitCached");
    const okUnit =
      await bf.getAssetInfo("unit200");
    const badUnit =
      await bf.getAssetInfo("unit400");
    const forbiddenUnit =
      await bf.getAssetInfo("unit403");
    const notUnit =
      await bf.getAssetInfo("unit404");
    const bannedUnit =
      await bf.getAssetInfo("unit418");
    const overUnit =
      await bf.getAssetInfo("unit429");
    const errorUnit =
      await bf.getAssetInfo("unit500");
    //#endregion

    //#region Assert
    expect(cachedUnit).toStrictEqual(atCache);
    expect(okUnit).toStrictEqual(at200);
    expect(badUnit).toStrictEqual(http400);
    expect(forbiddenUnit).toStrictEqual(http403);
    expect(notUnit).toStrictEqual(http404);
    expect(bannedUnit).toStrictEqual(http418);
    expect(overUnit).toStrictEqual(http429);
    expect(errorUnit).toStrictEqual(http500);
    //#endregion
  });

  it("getDatum", async () => {
    //#region Arrange
    const atCache: ScriptDatum = {
      "json_value": {
        "int": 42
      }
    };
    const at200: ScriptDatum = {
      "json_value": {
        "int": 200
      }
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): ScriptDatum | undefined => {
        // console.log({ key });
        return key === "bf./scripts/datum/hashCached"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/scripts/datum/hash200"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/scripts/datum/hash400"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/scripts/datum/hash403"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/scripts/datum/hash404"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/scripts/datum/hash418"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/scripts/datum/hash429"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedHash =
      await bf.getDatum("hashCached");
    const okHash =
      await bf.getDatum("hash200");
    const badHash =
      await bf.getDatum("hash400");
    const forbiddenHash =
      await bf.getDatum("hash403");
    const notHash =
      await bf.getDatum("hash404");
    const bannedHash =
      await bf.getDatum("hash418");
    const overHash =
      await bf.getDatum("hash429");
    const errorHash =
      await bf.getDatum("hash500");
    //#endregion

    //#region Assert
    expect(cachedHash).toStrictEqual(atCache);
    expect(okHash).toStrictEqual(at200);
    expect(badHash).toStrictEqual(http400);
    expect(forbiddenHash).toStrictEqual(http403);
    expect(notHash).toStrictEqual(http404);
    expect(bannedHash).toStrictEqual(http418);
    expect(overHash).toStrictEqual(http429);
    expect(errorHash).toStrictEqual(http500);
    //#endregion
  });

  it("getPoolMetadata", async () => {
    //#region Arrange
    const atCache: PoolMetadata = {
      "pool_id": "poolCached",
      "hex": "0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735",
      "url": "https://cached.pool",
      "hash": "47c0c68cb57f4a5b4a87bad896fc274678e7aea98e200fa14a1cb40c0cab1d8c",
      "ticker": "CACHE",
      "name": "Cached Pool",
      "description": "Cached Pool",
      "homepage": "https://cached.pool/"
    };
    const at200: PoolMetadata = {
      "pool_id": "pool200",
      "hex": "47c0c68cb57f4a5b4a87bad896fc274678e7aea98e200fa14a1cb40c0cab1d8c",
      "url": "https://ok.pool",
      "hash": "0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735",
      "ticker": "OK",
      "name": "OK Pool",
      "description": "OK Pool",
      "homepage": "https://ok.pool/"
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): PoolMetadata | undefined => {
        // console.log({ key });
        return key === "bf./pools/poolCached/metadata"
          ? atCache
          : undefined;
      });
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: string | URL | Request): Promise<Response> => {
        // console.log({ input });
        if (`${input}`.includes("/pools/pool200/metadata"))
          return new Response(
            JSON.stringify(at200),
            {
              status: 200,
              statusText: "OK",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/pools/pool400/metadata"))
          return new Response(
            JSON.stringify(http400),
            {
              status: 400,
              statusText: "Bad Request",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/pools/pool403/metadata"))
          return new Response(
            JSON.stringify(http403),
            {
              status: 403,
              statusText: "Forbidden",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/pools/pool404/metadata"))
          return new Response(
            JSON.stringify(http404),
            {
              status: 404,
              statusText: "Not Found",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/pools/pool418/metadata"))
          return new Response(
            JSON.stringify(http418),
            {
              status: 418,
              statusText: "Requested Banned",
              headers: {
                "content-type": "application/json",
              },
            });

        if (`${input}`.includes("/pools/pool429/metadata"))
          return new Response(
            JSON.stringify(http429),
            {
              status: 429,
              statusText: "Project Over Limit",
              headers: {
                "content-type": "application/json",
              },
            });

        return new Response(
          JSON.stringify(http500),
          {
            status: 500,
            statusText: "Internal Server Error",
            headers: {
              "content-type": "application/json",
            },
          });
      }
    );
    const cachedPool =
      await bf.getPoolMetadata("poolCached");
    const okPool =
      await bf.getPoolMetadata("pool200");
    const badPool =
      await bf.getPoolMetadata("pool400");
    const forbiddenPool =
      await bf.getPoolMetadata("pool403");
    const notPool =
      await bf.getPoolMetadata("pool404");
    const bannedPool =
      await bf.getPoolMetadata("pool418");
    const overPool =
      await bf.getPoolMetadata("pool429");
    const errorPool =
      await bf.getPoolMetadata("pool500");
    //#endregion

    //#region Assert
    expect(cachedPool).toStrictEqual(atCache);
    expect(okPool).toStrictEqual(at200);
    expect(badPool).toStrictEqual(http400);
    expect(forbiddenPool).toStrictEqual(http403);
    expect(notPool).toStrictEqual(http404);
    expect(bannedPool).toStrictEqual(http418);
    expect(overPool).toStrictEqual(http429);
    expect(errorPool).toStrictEqual(http500);
    //#endregion
  });
});
