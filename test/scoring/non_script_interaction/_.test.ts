import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fallback, scoring } from "../../../src/scoring/non_script_interaction/_";

describe("non_script_interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scoring", async () => {
    expect(scoring.length).toBeGreaterThanOrEqual(0);
  });

  it("fallback", async () => {
    expect(fallback).toBeTypeOf("function");
  });
});
