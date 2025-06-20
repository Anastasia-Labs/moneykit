import type { AddressDetails, Credential } from "@lucid-evolution/lucid";
import { Data, Effect } from "effect";
import { Cache } from "./Cache";

export class LucidError extends Data.TaggedError("LucidError")<{
  readonly name: string,
  readonly message: string,
  readonly cause: unknown,
}> {}

export const Lucid = {
  getAddressDetails:
    (address: string) =>
      Effect.gen(function* () {
        const key = `lucid.getAddressDetails(${address})`;
        const cache = yield* Cache;
        const cachedAddressDetails: AddressDetails | undefined =
          cache.get<AddressDetails>(key);
        if (cachedAddressDetails) return cachedAddressDetails;

        const addressDetails =
          yield* Effect.tryPromise({
            try:
              async () => {
                const { getAddressDetails } = await import("@lucid-evolution/lucid");
                const addressDetails = getAddressDetails(address);
                return addressDetails;
              },
            catch:
              (error) =>
                new LucidError({
                  name: "Lucid.getAddressDetails Error",
                  message: `getAddressDetails(${address}) failed.`,
                  cause: error,
                }),
          });

        cache.set<AddressDetails>(key, addressDetails, 60_000);
        return addressDetails;
      }),

  paymentCredentialOf:
    (address: string) =>
      Effect.gen(function* () {
        const key = `lucid.paymentCredentialOf(${address})`;
        const cache = yield* Cache;
        const cachedPaymentCredential: Credential | undefined =
          cache.get<Credential>(key);
        if (cachedPaymentCredential) return cachedPaymentCredential;

        const paymentCredential =
          yield* Effect.tryPromise({
            try:
              async () => {
                const { paymentCredentialOf } = await import("@lucid-evolution/lucid");
                const paymentCredential = paymentCredentialOf(address);
                return paymentCredential;
              },
            catch:
              (error) =>
                new LucidError({
                  name: "Lucid.paymentCredentialOf Error",
                  message: `paymentCredentialOf(${address}) failed.`,
                  cause: error,
                }),
          });

        cache.set<Credential>(key, paymentCredential, 60_000);
        return paymentCredential;
      }),

  stakeCredentialOf:
    (address: string) =>
      Effect.gen(function* () {
        const key = `lucid.stakeCredentialOf(${address})`;
        const cache = yield* Cache;
        const cachedStakeCredential: Credential | undefined =
          cache.get<Credential>(key);
        if (cachedStakeCredential) return cachedStakeCredential;

        const stakeCredential =
          yield* Effect.tryPromise({
            try:
              async () => {
                const { stakeCredentialOf } = await import("@lucid-evolution/lucid");
                const stakeCredential = stakeCredentialOf(address);
                return stakeCredential;
              },
            catch:
              (error) =>
                new LucidError({
                  name: "Lucid.stakeCredentialOf Error",
                  message: `stakeCredentialOf(${address}) failed.`,
                  cause: error,
                }),
          });

        cache.set<Credential>(key, stakeCredential, 60_000);
        return stakeCredential;
      }),

  fromText:
    (text: string) =>
      Effect.gen(function* () {
        const key = `lucid.fromText(${text})`;
        const cache = yield* Cache;
        const cachedHex: string | undefined =
          cache.get<string>(key);
        if (cachedHex) return cachedHex;

        const hex =
          yield* Effect.tryPromise({
            try:
              async () => {
                const { fromText } = await import("@lucid-evolution/lucid");
                const hex = fromText(text);
                return hex;
              },
            catch:
              (error) =>
                new LucidError({
                  name: "Lucid.fromText Error",
                  message: `fromText(${text}) failed.`,
                  cause: error,
                }),
          });

        cache.set<string>(key, hex, 60_000);
        return hex;
      }),

  toText:
    (hex: string) =>
      Effect.gen(function* () {
        const key = `lucid.toText(${hex})`;
        const cache = yield* Cache;
        const cachedText: string | undefined =
          cache.get<string>(key);
        if (cachedText) return cachedText;

        const text =
          yield* Effect.tryPromise({
            try:
              async () => {
                const { toText } = await import("@lucid-evolution/lucid");
                const text = toText(hex);
                return text;
              },
            catch:
              (error) =>
                new LucidError({
                  name: "Lucid.toText Error",
                  message: `toText(${hex}) failed.`,
                  cause: error,
                }),
          });

        cache.set<string>(key, text, 60_000);
        return text;
      }),
};
