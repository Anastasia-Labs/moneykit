import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import type * as BF from "@blockfrost/openapi";

import { Config, Context, Data, Effect, Layer, Redacted } from "effect";

import { Cache } from "./Cache";

export class BfError extends Data.TaggedError("BlockfrostError")<{
  readonly status_code?: number,
  readonly error?: string,
  readonly message?: string,
}> {}

export class BfAPI extends Context.Tag("BlockfrostAPI")<BfAPI, BlockFrostAPI>() {}

export const BfApiLive = Layer.effect(
  BfAPI,
  Effect.gen(function* () {
    const apiKey = yield* Config.option(
      Config.redacted("BF_PID")
    );

    if (apiKey._tag === "None") {
      return yield* Effect.fail(
        new BfError({
          status_code: 500,
          error: "No ProjectID",
          message: "Blockfrost ProjectID not set as an environment variable.",
        })
      );
    }

    const projectId = Redacted.value(apiKey.value);
    const API = new BlockFrostAPI({ projectId });
    return API;
  }).pipe(
    Effect.catchAllCause(
      (cause) =>
        Effect.gen(function* () {
          const { failure }: any = cause.toJSON();
          return yield* Effect.fail(
            new BfError({ ...failure })
          );
        })
    )
  ),
);

//#region Blockfrost Types
export type AddressInfo =
  BF.components["schemas"]["address_content"];
export type AddressTransactions =
  BF.components["schemas"]["address_transactions_content"];
export type TransactionInfo =
  BF.components["schemas"]["tx_content"];
export type TransactionUTXOs =
  BF.components["schemas"]["tx_content_utxo"];
export type TransactionMetadata =
  BF.components["schemas"]["tx_content_metadata"];
export type TransactionDelegations =
  BF.components["schemas"]["tx_content_delegations"];
export type TransactionWithdrawals =
  BF.components["schemas"]["tx_content_withdrawals"];
export type AssetInfo =
  BF.components["schemas"]["asset"];
export type ScriptDatum =
  BF.components["schemas"]["script_datum"];
export type PoolMetadata =
  BF.components["schemas"]["pool_metadata"];
//#endregion

export const Blockfrost = {
  getAddressInfo:
    (address: string) =>
      Effect.gen(function* () {
        const key = `bf.getAddressInfo(${address})`;
        const cache = yield* Cache;
        const cachedAddressInfo: AddressInfo | undefined =
          cache.get<AddressInfo>(key);
        if (cachedAddressInfo) return cachedAddressInfo;

        const API = yield* BfAPI;
        const addressInfo =
          yield* Effect.tryPromise(
            () =>
              API.addresses(address)
          );

        cache.set<AddressInfo>(key, addressInfo, 60);
        return addressInfo;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getAddressTransactions:
    (address: string, count: number) =>
      Effect.gen(function* () {
        const key = `bf.getAddressTransactions(${address})`;
        const cache = yield* Cache;
        const cachedAddressTransactions: AddressTransactions | undefined =
          cache.get<AddressTransactions>(key);
        if (cachedAddressTransactions) return cachedAddressTransactions;

        const API = yield* BfAPI;
        const addressTransactions =
          yield* Effect.tryPromise(
            () =>
              API.addressesTransactions(address, { order: "desc", count })
          );

        cache.set<AddressTransactions>(key, addressTransactions, 60);
        return addressTransactions;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getTransactionInfo:
    (hash: string) =>
      Effect.gen(function* () {
        const key = `bf.getTransactionInfo(${hash})`;
        const cache = yield* Cache;
        const cachedTransactionInfo: TransactionInfo | undefined =
          cache.get<TransactionInfo>(key);
        if (cachedTransactionInfo) return cachedTransactionInfo;

        const API = yield* BfAPI;
        const transactionInfo =
          yield* Effect.tryPromise(
            () =>
              API.txs(hash)
          );

        cache.set<TransactionInfo>(key, transactionInfo, 60_000);
        return transactionInfo;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getTransactionUTXOs:
    (hash: string) =>
      Effect.gen(function* () {
        const key = `bf.getTransactionUTXOs(${hash})`;
        const cache = yield* Cache;
        const cachedTransactionUTXOs: TransactionUTXOs | undefined =
          cache.get<TransactionUTXOs>(key);
        if (cachedTransactionUTXOs) return cachedTransactionUTXOs;

        const API = yield* BfAPI;
        const transactionUTXOs =
          yield* Effect.tryPromise(
            () =>
              API.txsUtxos(hash)
          );

        cache.set<TransactionUTXOs>(key, transactionUTXOs, 60_000);
        return transactionUTXOs;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getTransactionMetadata:
    (hash: string) =>
      Effect.gen(function* () {
        const key = `bf.getTransactionMetadata(${hash})`;
        const cache = yield* Cache;
        const cachedTransactionMetadata: TransactionMetadata | undefined =
          cache.get<TransactionMetadata>(key);
        if (cachedTransactionMetadata) return cachedTransactionMetadata;

        const API = yield* BfAPI;
        const transactionMetadata =
          yield* Effect.tryPromise(
            () =>
              API.txsMetadata(hash)
          );

        cache.set<TransactionMetadata>(key, transactionMetadata, 60_000);
        return transactionMetadata;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getTransactionDelegations:
    (hash: string) =>
      Effect.gen(function* () {
        const key = `bf.getTransactionDelegations(${hash})`;
        const cache = yield* Cache;
        const cachedTransactionDelegations: TransactionDelegations | undefined =
          cache.get<TransactionDelegations>(key);
        if (cachedTransactionDelegations) return cachedTransactionDelegations;

        const API = yield* BfAPI;
        const transactionDelegations =
          yield* Effect.tryPromise(
            () =>
              API.txsDelegations(hash)
          );

        cache.set<TransactionDelegations>(key, transactionDelegations, 60_000);
        return transactionDelegations;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getTransactionWithdrawals:
    (hash: string) =>
      Effect.gen(function* () {
        const key = `bf.getTransactionWithdrawals(${hash})`;
        const cache = yield* Cache;
        const cachedTransactionWithdrawals: TransactionWithdrawals | undefined =
          cache.get<TransactionWithdrawals>(key);
        if (cachedTransactionWithdrawals) return cachedTransactionWithdrawals;

        const API = yield* BfAPI;
        const transactionWithdrawals =
          yield* Effect.tryPromise(
            () =>
              API.txsWithdrawals(hash)
          );

        cache.set<TransactionWithdrawals>(key, transactionWithdrawals, 60_000);
        return transactionWithdrawals;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getAssetInfo:
    (unit: string) =>
      Effect.gen(function* () {
        const key = `bf.getAssetInfo(${unit})`;
        const cache = yield* Cache;
        const cachedAssetInfo: AssetInfo | undefined =
          cache.get<AssetInfo>(key);
        if (cachedAssetInfo) return cachedAssetInfo;

        const API = yield* BfAPI;
        const assetInfo =
          yield* Effect.tryPromise(
            () =>
              API.assetsById(unit)
          );

        cache.set<AssetInfo>(key, assetInfo, 60);
        return assetInfo;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getDatum:
    (hash: string) =>
      Effect.gen(function* () {
        const key = `bf.getDatum(${hash})`;
        const cache = yield* Cache;
        const cachedDatum: ScriptDatum | undefined =
          cache.get<ScriptDatum>(key);
        if (cachedDatum) return cachedDatum;

        const API = yield* BfAPI;
        const datum =
          yield* Effect.tryPromise(
            () =>
              API.scriptsDatum(hash)
          );

        cache.set<ScriptDatum>(key, datum, 60_000);
        return datum;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),

  getPoolMetadata:
    (id: string) =>
      Effect.gen(function* () {
        const key = `bf.getPoolMetadata(${id})`;
        const cache = yield* Cache;
        const cachedPoolMetadata: PoolMetadata | undefined =
          cache.get<PoolMetadata>(key);
        if (cachedPoolMetadata) return cachedPoolMetadata;

        const API = yield* BfAPI;
        const poolMetadata =
          yield* Effect.tryPromise(
            () =>
              API.poolMetadata(id)
          );

        cache.set<PoolMetadata>(key, poolMetadata, 60);
        return poolMetadata;
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              const errorMessage = `${failure.cause}`;
              if (errorMessage.indexOf(": ") > 0) {
                const [error, message] = errorMessage.split(": ");
                return yield* Effect.fail(
                  new BfError({
                    ...eval(failure).cause,
                    error, message,
                  })
                );
              } else {
                return yield* Effect.fail(
                  new BfError({ ...failure })
                );
              }
            })
        )
      ),
};
