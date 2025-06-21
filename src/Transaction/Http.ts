import { Effect } from "effect";

import { HttpApiBuilder } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";

import { Describer, DescriberLayerLive, DistinctCategoriesLive, DistinctProjectsLive, HttpApiDescriberError } from "./Describer";

import { Api } from "../Api";
import { CacheLive } from "../Service/Cache";

export const HttpDescriberLive = HttpApiBuilder.group(
  Api,
  "describer",
  (handlers) =>
    handlers

      .handle(
        "stats",
        () =>
          Describer.getStats().pipe(
            Effect.provide(DescriberLayerLive),
            Effect.provide(DistinctProjectsLive),
            Effect.provide(DistinctCategoriesLive),
            Effect.provide(NodeContext.layer),
          ).pipe(
            Effect.catchAllCause(
              (cause) =>
                Effect.gen(function* () {
                  const { failure }: any = cause.toJSON();
                  return yield* Effect.fail(
                    new HttpApiDescriberError({ ...failure })
                  );
                })
            )
          )
      )

      .handle(
        "addressTransactions",
        ({ path, urlParams }) =>
          Describer.describeAddressTransactions(path.address, urlParams.count).pipe(
            Effect.provide(DescriberLayerLive),
            Effect.provide(DistinctProjectsLive),
            Effect.provide(DistinctCategoriesLive),
            // Effect.provide(BfApiLive),
            Effect.provide(CacheLive),
            Effect.provide(NodeContext.layer),
          ).pipe(
            Effect.catchAllCause(
              (cause) =>
                Effect.gen(function* () {
                  const { failure }: any = cause.toJSON();
                  return yield* Effect.fail(
                    new HttpApiDescriberError({ ...failure })
                  );
                })
            )
          )
      )

      .handle(
        "specificAddressTransaction",
        ({ path }) =>
          Describer.describeSpecificAddressTransaction(path.address, path.hash).pipe(
            Effect.provide(DescriberLayerLive),
            Effect.provide(DistinctProjectsLive),
            Effect.provide(DistinctCategoriesLive),
            // Effect.provide(BfApiLive),
            Effect.provide(CacheLive),
            Effect.provide(NodeContext.layer),
          ).pipe(
            Effect.catchAllCause(
              (cause) =>
                Effect.gen(function* () {
                  const { failure }: any = cause.toJSON();
                  return yield* Effect.fail(
                    new HttpApiDescriberError({ ...failure })
                  );
                })
            )
          )
      )

  ,
);
