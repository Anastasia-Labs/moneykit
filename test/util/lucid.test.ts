import { AddressDetails, Credential } from "@lucid-evolution/lucid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cache, lucid } from "../../src/util/_";

vi.mock("@lucid-evolution/lucid",
  () => {
    return {
      getAddressDetails: vi.fn(
        (address: string): AddressDetails => {
          // console.log({ address });
          return {
            address: {
              bech32: address,
              hex: address,
            },
            networkId: 1,
            type: "Base",
            paymentCredential: {
              hash: address.endsWith("Key") ? "Key" : "Script",
              type: address.endsWith("Key") ? "Key" : "Script",
            },
          };
        },
      ),

      paymentCredentialOf: vi.fn(
        (address: string): Credential => {
          // console.log({ address });
          return {
            hash: address.endsWith("Key") ? "Key" : "Script",
            type: address.endsWith("Key") ? "Key" : "Script",
          };
        }
      ),

      stakeCredentialOf: vi.fn(
        (address: string): Credential => {
          // console.log({ address });
          return {
            hash: address.endsWith("Key") ? "Key" : "Script",
            type: address.endsWith("Key") ? "Key" : "Script",
          };
        }
      ),

      fromText: vi.fn(
        (text: string): string => {
          // console.log({ text });
          return "6d79746f6b656e";
        }
      ),

      toText: vi.fn(
        (hex: string): string => {
          // console.log({ hex });
          return "mytoken";
        }
      ),
    };
  },
);

describe("lucid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getAddressDetails", async () => {
    //#region Arrange
    const addrCached: AddressDetails = {
      address: {
        bech32: "addrCached",
        hex: "addrCached",
      },
      networkId: 1,
      type: "Base",
    };
    const addr1Key: AddressDetails = {
      address: {
        bech32: "addr1Key",
        hex: "addr1Key",
      },
      networkId: 1,
      type: "Base",
      paymentCredential: {
        hash: "Key",
        type: "Key",
      },
    };
    const addr2Script: AddressDetails = {
      address: {
        bech32: "addr2Script",
        hex: "addr2Script",
      },
      networkId: 1,
      type: "Base",
      paymentCredential: {
        hash: "Script",
        type: "Script",
      },
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): AddressDetails | undefined => {
        // console.log({ key });
        return key === "lucid.getAddressDetails(addrCached)"
          ? addrCached
          : undefined;
      });

    const cachedAddr =
      await lucid.getAddressDetails("addrCached");
    const keyAddr =
      await lucid.getAddressDetails("addr1Key");
    const scriptAddr =
      await lucid.getAddressDetails("addr2Script");
    //#endregion

    //#region Assert
    expect(cachedAddr).toStrictEqual(addrCached);
    expect(keyAddr).toStrictEqual(addr1Key);
    expect(scriptAddr).toStrictEqual(addr2Script);
    //#endregion
  });

  it("paymentCredentialOf", async () => {
    //#region Arrange
    const addrCached: Credential = {
      hash: "cached",
      type: "Script",
    };
    const addr1Key: Credential = {
      hash: "Key",
      type: "Key",
    };
    const addr2Script: Credential = {
      hash: "Script",
      type: "Script",
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): Credential | undefined => {
        // console.log({ key });
        return key === "lucid.paymentCredentialOf(addrCached)"
          ? addrCached
          : undefined;
      });

    const cachedAddr =
      await lucid.paymentCredentialOf("addrCached");
    const keyAddr =
      await lucid.paymentCredentialOf("addr1Key");
    const scriptAddr =
      await lucid.paymentCredentialOf("addr2Script");
    //#endregion

    //#region Assert
    expect(cachedAddr).toStrictEqual(addrCached);
    expect(keyAddr).toStrictEqual(addr1Key);
    expect(scriptAddr).toStrictEqual(addr2Script);
    //#endregion
  });

  it("stakeCredentialOf", async () => {
    //#region Arrange
    const addrCached: Credential = {
      hash: "cached",
      type: "Script",
    };
    const addr1Key: Credential = {
      hash: "Key",
      type: "Key",
    };
    const addr2Script: Credential = {
      hash: "Script",
      type: "Script",
    };
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): Credential | undefined => {
        // console.log({ key });
        return key === "lucid.stakeCredentialOf(addrCached)"
          ? addrCached
          : undefined;
      });

    const cachedAddr =
      await lucid.stakeCredentialOf("addrCached");
    const keyAddr =
      await lucid.stakeCredentialOf("addr1Key");
    const scriptAddr =
      await lucid.stakeCredentialOf("addr2Script");
    //#endregion

    //#region Assert
    expect(cachedAddr).toStrictEqual(addrCached);
    expect(keyAddr).toStrictEqual(addr1Key);
    expect(scriptAddr).toStrictEqual(addr2Script);
    //#endregion
  });

  it("fromText", async () => {
    //#region Arrange
    const textCached = "cached";
    const notCached = "6d79746f6b656e";
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): string | undefined => {
        // console.log({ key });
        return key === "lucid.fromText(textCached)"
          ? textCached
          : undefined;
      });

    const cachedText =
      await lucid.fromText("textCached");
    const hexText =
      await lucid.fromText("mytoken");
    //#endregion

    //#region Assert
    expect(cachedText).toStrictEqual(textCached);
    expect(hexText).toStrictEqual(notCached);
    //#endregion
  });

  it("toText", async () => {
    //#region Arrange
    const textCached = "cached";
    const notCached = "mytoken";
    //#endregion

    //#region Act
    vi.spyOn(cache, "get").mockImplementation(
      (key: string): string | undefined => {
        // console.log({ key });
        return key === "lucid.toText(textCached)"
          ? textCached
          : undefined;
      });

    const cachedText =
      await lucid.toText("textCached");
    const hexText =
      await lucid.toText("6d79746f6b656e");
    //#endregion

    //#region Assert
    expect(cachedText).toStrictEqual(textCached);
    expect(hexText).toStrictEqual(notCached);
    //#endregion
  });
});
