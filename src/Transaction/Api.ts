import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";

import { HttpApiDescriberError } from "./Describer";

import { StatsSchema } from "../Domain/Types";
import ManifestSchema from "../Domain/Manifest";

// const address =
//   HttpApiSchema.param("address", Schema.String);
// const hash =
//   HttpApiSchema.param("hash", Schema.String);

export class DescriberAPI extends HttpApiGroup.make("describer")
  .add(
    HttpApiEndpoint
      .get("stats")`/api/v0/stats`
      .addSuccess(StatsSchema)
      .addError(HttpApiDescriberError)
  )
  .add(
    HttpApiEndpoint
      // .get("addressTransactions")`/api/v0/addresses/${address}`
      .get("addressTransactions", "/api/v0/addresses/:address")
      .setPath(
        Schema.Struct({ address: Schema.String })
      )
      .setUrlParams(
        Schema.Struct({ count: Schema.NumberFromString })
      )
      .addSuccess(ManifestSchema)
      .addError(HttpApiDescriberError)
  )
  .add(
    HttpApiEndpoint
      // .get("specificAddressTransaction")`/api/v0/addresses/${address}/txs/${hash}`
      .get("specificAddressTransaction", "/api/v0/addresses/:address/txs/:hash")
      .setPath(
        Schema.Struct({
          address: Schema.String,
          hash: Schema.String,
        })
      )
      .addSuccess(ManifestSchema)
      .addError(HttpApiDescriberError)
  )
  .annotate(OpenApi.Title, "Transaction Describer")
  .annotate(OpenApi.Description, "Describe transactions into manifests.")
{}
