import { Schema } from "effect";
import type { AddressDetails } from "@lucid-evolution/lucid";

import type { Transaction } from "./Manifest";
import type { AddressInfo, TransactionInfo, TransactionUTXOs } from "../Service/Blockfrost";

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
export type CalculatedScore<AdditionalData> =
  readonly [Score, AdditionalData];
export type TransactionScore = {
  readonly type: string;
  readonly description: string;
  readonly score: Score;
};

export type ScoringFn = (
  intermediaryTx: Transaction,
  addressInfo: AddressInfo,
  addressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
) => Promise<TransactionScore>;
export type ScoringSvc = {
  readonly scoring: Array<ScoringFn>;
  readonly fallback: ScoringFn;
};
//#endregion
