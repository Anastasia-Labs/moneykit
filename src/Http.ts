import { createServer } from "http";
import { Layer } from "effect";

import { NodeHttpServer } from "@effect/platform-node";
import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform";

import { Api } from "./Api";
import { HttpDescriberLive } from "./Transaction/Http";

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  HttpDescriberLive,
]);

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 35183 })),
);
