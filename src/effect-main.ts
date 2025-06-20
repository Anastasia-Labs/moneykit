import { Layer } from "effect";
import { NodeRuntime } from "@effect/platform-node";

import { HttpLive } from "./Http";

HttpLive.pipe(
  Layer.launch,
  NodeRuntime.runMain,
);
