import * as Path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      app: Path.join(__dirname, "src")
    },
    // coverage: {
    //   include: ["src/**/**.ts"],
    //   reporter: ["html", "lcov", "text"],
    //   thresholds: {
    //     statements: 75,
    //     branches: 70,
    //     functions: 80,
    //     lines: 75,
    //   },
    // },
  },
});
