import { Context, Data, Effect, Layer, Schema } from "effect";
import { FileSystem, HttpApiSchema, Path } from "@effect/platform";

import ManifestSchema from "../Domain/Manifest";
import type { Manifest, Transaction } from "../Domain/Manifest";
import type { AddressAmounts, ScDesc, ScDescLookup, Stats } from "../Domain/Types";

import type { TransactionMetadata, TransactionWithdrawals } from "../Service/Blockfrost";
import { BfApiLive, BfError, Blockfrost } from "../Service/Blockfrost";
import { Lucid } from "../Service/Lucid";
import { Util } from "../Service/Util";

const DAPPS_PATH = "./crfa-offchain-data-registry/dApps";

const DISTINCT_PROJECTS: Set<string> = new Set();
const DISTINCT_CATEGORIES: Set<string> = new Set([
  "unknown_activity",
  // "self_transaction",
  "catalyst_registration",
  "catalyst_deregistration",
  "receive_ada",
  "send_ada",
  "receive_tokens",
  "send_tokens",
  "token_minting",
  "stake_registration",
  "stake_delegation",
  "multi_stake_delegation",
  "setup_collateral",
  "yield_farming",
]);

//#region Initialize Known Dapps
export class DistinctProjects extends Context.Tag("DistinctProjects")<DistinctProjects, Set<string>>() {}
export const DistinctProjectsLive = Layer.effect(
  DistinctProjects,
  Effect.succeed(DISTINCT_PROJECTS),
);

export class DistinctCategories extends Context.Tag("DistinctCategories")<DistinctCategories, Set<string>>() {}
export const DistinctCategoriesLive = Layer.effect(
  DistinctCategories,
  Effect.succeed(DISTINCT_CATEGORIES),
);

export class DescriberLayer extends Context.Tag("DescriberLayer")<DescriberLayer, {
  readonly scDesc: Record<string, ScDesc>;
  readonly distinctProjects: ReadonlySet<string>;
  readonly distinctCategories: ReadonlySet<string>;
  readonly stats: Stats;
}>() {}

export const DescriberLayerLive = Layer.effect(
  DescriberLayer,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const scDesc: ScDescLookup = {};

    const distinctProjects = yield* DistinctProjects;
    const distinctCategories = yield* DistinctCategories;

    const dapps = yield* fs.readDirectory(DAPPS_PATH);
    for (const dapp of dapps) {
      const dappPath = path.join(DAPPS_PATH, dapp);
      const dappFile = yield* fs.readFileString(dappPath, "utf8");

      const { category, projectName, scripts, subCategory } = JSON.parse(dappFile);
      for (const { name, versions } of scripts) {
        for (const { contractAddress } of versions) {
          const tranType =
            `${!subCategory || subCategory === '-' ? category : subCategory}`
              .replaceAll(" ", "_")
              .toLowerCase();

          scDesc[contractAddress] = {
            name,
            projectName,
            category: tranType === "dex" ? "other_dex" : tranType,
            description: `${name ?? "Unknown activity"} on ${projectName}`,
            role: `${name}`.startsWith(projectName) ? name : `${projectName} ${name ?? "Address"}`,
          };

          distinctProjects.add(scDesc[contractAddress].projectName);
          distinctCategories.add(scDesc[contractAddress].category);
        }
      }
    }

    const stats: Stats = {
      category: {
        names: [...distinctCategories].sort(
          (l, r) =>
            l < r ? -1 : 1
        ),
        count: distinctCategories.size,
      },
      merchant: {
        names: [...distinctProjects].sort(
          (l, r) =>
            l.toLowerCase() < r.toLowerCase() ? -1 : 1
        ),
        count: distinctProjects.size,
      },
    };

    return { scDesc, distinctProjects, distinctCategories, stats };
  }).pipe(
    Effect.catchAllCause(
      (cause) =>
        Effect.gen(function* () {
          const { failure }: any = cause.toJSON();
          return yield* Effect.fail(
            new DescriberError({ ...failure })
          );
        })
    )
  ),
);

// export const customMock = FileSystem.layerNoop({
//   readFileString: () => Effect.succeed("mocked content"),
//   exists: (path) => Effect.succeed(path === "/some/path"),
// });

// /** EXAMPLE: Provide the customized FileSystem mock implementation
//  *           and NodeContext.layer for Path from @effect/platform
//  */
// NodeRuntime.runMain(
//   program.pipe(
//     Effect.provide(customMock),
//     Effect.provide(NodeContext.layer),
//   ),
// );
//#endregion

export class DescriberError extends Data.TaggedError("DescriberError")<typeof DescriberErrorSchema.Type> {}

export const Describer = {
  getStats:
    () =>
      Effect.gen(function* () {
        const { stats } = yield* DescriberLayer;
        return stats;
      }),

  describeAddressTransactions:
    (address: string, count: number) =>
      Effect.gen(function* () {
        const addressTransactions =
          yield* Blockfrost.getAddressTransactions(address, count);

        const addressTransactionsManifest: Array<Transaction> = [];

        // DO NOT BURST BLOCKFROST BY USING Promise.all
        for (const addressTransaction of addressTransactions) {
          const hash = addressTransaction.tx_hash;
          const { transactions } =
            yield* Describer.describeSpecificAddressTransaction(address, hash);
          if (transactions.length === 1) {
            const [transaction] = transactions;
            addressTransactionsManifest.push(transaction);
          }
        }

        const manifest: Manifest = {
          ...ManifestSchema.prototype.placeholder,
          transactions: addressTransactionsManifest,
        };
        return manifest;
      }).pipe(
        Effect.provide(BfApiLive),
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              return yield* Effect.fail(
                new DescriberError({ ...failure })
              );
            })
        ),
      ),

  describeSpecificAddressTransaction:
    (address: string, hash: string) =>
      Effect.gen(function* () {
        const { distinctProjects, scDesc } = yield* DescriberLayer;

        const addressInfo =
          yield* Blockfrost.getAddressInfo(address);

        const addressDetails =
          yield* Lucid.getAddressDetails(address);

        const tx =
          yield* Effect.match(
            Blockfrost.getTransactionInfo(hash),
            {
              onSuccess:
                (info) =>
                  info,
              onFailure:
                (error) =>
                  error,
            });
        if (tx instanceof BfError) {
          return yield* new DescriberError({
            status_code: 400,
            error: `Blockfrost Error: ${tx.error}`,
            message: "Invalid or malformed transaction hash.",
          });
        }

        const timestamp = tx.block_time * 1_000;
        const networkFee = BigInt(tx.fees);

        //#region TransactionUTXOs
        const addressAmounts: AddressAmounts = {};
        const userAddressAmounts: AddressAmounts = {};
        const otherAddressAmounts: AddressAmounts = {};

        let tranType = `${undefined}`;
        let tranDesc = `${undefined}`;

        const probableProjects: Set<string> = new Set();

        const utxos =
          yield* Blockfrost.getTransactionUTXOs(hash);
        const { inputs, outputs } = utxos;

        //#region Process UTxO Inputs
        for (const { address, amount, collateral, reference } of inputs) {
          if (collateral || reference) continue; // skip collateral | ref utxos
          if (!addressAmounts[address]) addressAmounts[address] = {};

          for (const { quantity, unit } of amount) {
            const currency = unit === "lovelace" ? "ADA" : unit;
            const amount = BigInt(quantity);
            addressAmounts[address][currency] =
              (addressAmounts[address][currency] ?? 0n) - amount;
          }

          if (scDesc[address]) {
            tranType = scDesc[address].category;
            tranDesc = scDesc[address].description;
            probableProjects.add(scDesc[address].projectName);
          }
        }
        //#endregion

        //#region Process UTxO Outputs
        for (const { address, amount, collateral } of outputs) {
          if (collateral) continue; // skip collateral utxo
          if (!addressAmounts[address]) addressAmounts[address] = {};

          for (const { quantity, unit } of amount) {
            const currency = unit === "lovelace" ? "ADA" : unit;
            const amount = BigInt(quantity);
            addressAmounts[address][currency] =
              (addressAmounts[address][currency] ?? 0n) + amount;
          }

          if (scDesc[address]) {
            tranType = scDesc[address].category;
            tranDesc = scDesc[address].description;
            probableProjects.add(scDesc[address].projectName);
          }
        }
        //#endregion

        //#region Group AddressAmounts by Credential
        for (const address of Object.keys(addressAmounts)) {
          const { paymentCredential, stakeCredential } =
            yield* Lucid.getAddressDetails(address);

          if (
            (paymentCredential && paymentCredential.hash === addressDetails.paymentCredential?.hash) ||
            (stakeCredential && stakeCredential.hash === addressDetails.stakeCredential?.hash)
          ) {
            userAddressAmounts[address] = addressAmounts[address];
          } else {
            otherAddressAmounts[address] = addressAmounts[address];
          }
        }
        //#endregion
        //#endregion

        //#region Transaction Metadata
        const metadata =
          yield* Effect.match(
            Blockfrost.getTransactionMetadata(hash),
            {
              onSuccess:
                (metadata) =>
                  metadata,
              onFailure:
                (): TransactionMetadata =>
                  [],
            },
          );

        metadata.forEach(
          ({ json_metadata }) => {
            if (typeof json_metadata === "string") return; // skip non-record metadata
            if (!Array.isArray(json_metadata.msg)) return; // skip non-array msg
            json_metadata.msg.forEach(
              (msg) => {
                for (const project of distinctProjects) {
                  if (`${msg}`.toUpperCase().includes(project.toUpperCase())) {
                    probableProjects.add(project);
                  }
                }
              }
            );
          }
        );
        //#endregion

        //#region Transaction Withdrawals
        const withdrawals =
          yield* Effect.match(
            Blockfrost.getTransactionWithdrawals(hash),
            {
              onSuccess:
                (withdrawals) =>
                  withdrawals,
              onFailure:
                (): TransactionWithdrawals =>
                  []
            }
          );

        const withdrawalAmount =
          withdrawals.reduce(
            (sum, { address, amount }) =>
              sum += address === addressInfo.stake_address ? BigInt(amount) : 0n,
            0n,
          );
        //#endregion

        //#region Intermediary Transaction object
        const transaction: Transaction = {
          transaction_id: hash,
          timestamp,
          type: tranType,
          description: tranDesc,
          confidence: null,

          accounts: {
            user: yield* Util.convertAddressAmountsToAccounts(
              userAddressAmounts,
              "User Address",
              scDesc,
            ),
            other: yield* Util.convertAddressAmountsToAccounts(
              otherAddressAmounts,
              undefined,
              scDesc,
            ),
          },

          withdrawal_amount: withdrawalAmount === 0n ? undefined : {
            currency: "ADA",
            amount: yield* Util.convertAmountToNumber(withdrawalAmount, 6),
          },

          network_fee: {
            currency: "ADA",
            amount: yield* Util.convertAmountToNumber(networkFee, 6),
          },

          metadata,
        };
        //#endregion

        // TODO: Post-process the intermediary Transaction object

        const manifest: Manifest = {
          ...ManifestSchema.prototype.placeholder,
          transactions: [transaction]
        };
        return manifest;
      }).pipe(
        Effect.provide(BfApiLive),
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const { failure }: any = cause.toJSON();
              return yield* Effect.fail(
                new DescriberError({ ...failure })
              );
            })
        ),
      ),
};

export class DescriberErrorSchema extends Schema.Struct({
  status_code: Schema.UndefinedOr(Schema.Int),
  error: Schema.UndefinedOr(Schema.String),
  message: Schema.UndefinedOr(Schema.String),
}) {}

export class HttpApiDescriberError extends Schema.TaggedError<HttpApiDescriberError>()(
  "HttpApiDescriberError",
  DescriberErrorSchema,
  HttpApiSchema.annotations({ status: 500 }), // TODO: status from status_code
) {}
