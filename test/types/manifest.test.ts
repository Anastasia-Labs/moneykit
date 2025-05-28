import { RandomUUIDOptions, UUID } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Manifest } from "../../src/types/manifest";
import { manifest } from "../../src/types/_";

vi.mock("crypto",
  () => {
    return {
      randomUUID: vi.fn(
        (options?: RandomUUIDOptions | undefined): UUID => {
          // console.log({ options });
          return "12345678-1234-1234-1234-1234567890ab";
        },
      ),
    };
  },
);

describe("manifest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("placeholder", async () => {
    //#region Arrange
    const defaultPlaceholder: Manifest = {
      version: 0,
      id: "12345678-1234-1234-1234-1234567890ab",
      institution: {
        name: "Cardano",
        network: "Mainnet",
      },
      transactions: [],
    };
    //#endregion

    //#region Act
    const defaultManifest = manifest.default();
    //#endregion

    //#region Assert
    expect(defaultManifest).toStrictEqual(defaultPlaceholder);
    //#endregion
  });
});
