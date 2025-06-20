import type * as BF from "@blockfrost/openapi";
import type { AddressDetails } from "@lucid-evolution/lucid";

import { Schema } from "effect";

import type { Transaction } from "./Manifest";
import type { AddressInfo } from "../Service/Blockfrost";

export class ScDescSchema extends Schema.Struct({
  name: Schema.String,
  projectName: Schema.String,
  category: Schema.String,
  description: Schema.String,
  role: Schema.String,
}) {}
export type ScDesc = typeof ScDescSchema.Type;

export const ScDescLookupSchema =
  Schema.mutable(
    Schema.Record({
      key: Schema.String,
      value: ScDescSchema,
    })
  );
export type ScDescLookup = typeof ScDescLookupSchema.Type;

export class StatsSchema extends Schema.Struct({
  category: Schema.Struct({
    names: Schema.Array(Schema.String),
    count: Schema.Int,
  }),
  merchant: Schema.Struct({
    names: Schema.Array(Schema.String),
    count: Schema.Int,
  }),
}) {}
export type Stats = typeof StatsSchema.Type;

export const AmountsSchema =
  Schema.mutable(
    Schema.Record({
      key: Schema.String,
      value: Schema.BigIntFromSelf,
    })
  );
export type Amounts = typeof AmountsSchema.Type;

export const AddressAmountsSchema =
  Schema.mutable(
    Schema.Record({
      key: Schema.String,
      value: AmountsSchema,
    })
  );
export type AddressAmounts = typeof AddressAmountsSchema.Type;

//#region Scoring
export type Score = number;
export type CalculatedScore<AdditionalData> = [Score, AdditionalData];
export type TransactionScore = {
  type: string;
  description: string;
  score: Score;
};

export type ScoringFn = (
  intermediaryTx: Transaction,
  bfAddressInfo: AddressInfo,
  lucidAddressDetails: AddressDetails,
  txInfo: BF.components["schemas"]["tx_content"],
  txUTXOs: BF.components["schemas"]["tx_content_utxo"],
) => Promise<TransactionScore>;
export type ScoringSvc = {
  scoring: Array<ScoringFn>;
  fallback: ScoringFn;
};
//#endregion
