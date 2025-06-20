import NodeCache from "node-cache";
import { Context, Effect, Layer } from "effect";

const CACHE = new NodeCache();

export class Cache extends Context.Tag("NodeCache")<Cache, NodeCache>() {}

export const CacheLive = Layer.effect(
  Cache,
  Effect.succeed(CACHE),
);
