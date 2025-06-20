import { randomUUID } from "crypto";
import { Schema } from "effect";

export class AssetSchema extends Schema.Struct({
  currency: Schema.propertySignature(Schema.String).annotations({
    identifier: "Asset.Currency",
    description: "The token name of the particular asset.",
    title: "Asset Currency",
    // default: "",
    examples: ["ADA"],
  }),
  amount: Schema.propertySignature(Schema.Number).annotations({
    identifier: "Asset.Amount",
    description: "The quantity of the particular asset.",
    title: "Asset Amount",
    // default: NaN,
    examples: [0, 1.2, -34.56],
  }),
}) {}
export type Asset = typeof AssetSchema.Type;

export class AccountSchema extends Schema.Struct({
  address: Schema.propertySignature(Schema.String).annotations({
    identifier: "Account.Address",
    description: "Bech32 Cardano Address",
    title: "Account Address",
    // default: "",
    examples: ["addr1_..."],
  }),
  role: Schema.propertySignature(Schema.String).annotations({
    identifier: "Account.Role",
    description: "The role describing the address.",
    title: "Account Role",
    // default: "",
    examples: ["User Address", "Unknown Address", "Unknown Script", "etc"],
  }),
  total: Schema.propertySignature(
    Schema.Array(AssetSchema)
  ).annotations({
    identifier: "Account.Total",
    description: "The aggregate amount of the movement of values.",
    title: "Account Total",
    // default: [],
    examples: [[{
      currency: "ADA",
      amount: 12.789,
    }]],
  }),
}) {}
export type Account = typeof AccountSchema.Type;

export class TransactionSchema extends Schema.Struct({
  transaction_id: Schema.propertySignature(Schema.String).annotations({
    identifier: "Transaction.ID",
    description: "The transaction hash.",
    title: "Transaction ID",
    // default: "",
    examples: ["Tx Hash"],
  }),
  timestamp: Schema.propertySignature(
    Schema.Int.pipe(
      Schema.greaterThanOrEqualTo(0)
    )
  ).annotations({
    identifier: "Transaction.Timestamp",
    description: "The transaction timestamp in epoch millisecond.",
    title: "Transaction Timestamp",
    // default: 0,
    examples: [1234567890000],
  }),
  type: Schema.propertySignature(Schema.String).annotations({
    identifier: "Transaction.Type",
    description: "One of the transaction categories.",
    title: "Transaction Type",
    // default: "",
    examples: ["undefined"],
  }),
  description: Schema.propertySignature(Schema.String).annotations({
    identifier: "Transaction.Description",
    description: "The human-readable description of the transaction.",
    title: "Transaction Description",
    // default: "",
    examples: ["undefined"],
  }),
  confidence: Schema.propertySignature(
    Schema.NullOr(
      Schema.Int.pipe(
        Schema.between(0, 100)
      )
    )
  ).annotations({
    identifier: "Transaction.Confidence",
    description: "The transaction type and description confidence level.",
    title: "Transaction Confidence",
    // default: 100,
    examples: [99, 0],
  }),
  accounts: Schema.propertySignature(
    Schema.Struct({
      user: Schema.propertySignature(
        Schema.Array(AccountSchema)
      ).annotations({
        identifier: "Transaction.Accounts.User",
        description: "The accounts associated with the input address.",
        title: "User Accounts",
        // default: [],
        examples: [[{
          address: "addr1user",
          role: "User Address",
          total: [{
            currency: "ADA",
            amount: 7890.3456,
          }],
        }]],
      }),
      other: Schema.propertySignature(
        Schema.Array(AccountSchema)
      ).annotations({
        identifier: "Transaction.Accounts.Other",
        description: "The accounts not associated with the input address.",
        title: "Other Accounts",
        // default: [],
        examples: [[
          {
            address: "addr1other",
            role: "Unknown Address",
            total: [{
              currency: "ADA",
              amount: 54321.09876,
            }],
          },
          {
            address: "addr2other",
            role: "Unknown Script",
            total: [{
              currency: "ADA",
              amount: 789012.123456,
            }],
          },
        ]],
      }),
    })
  ).annotations({
    identifier: "Transaction.Accounts",
    description: "The accounts associated with the particular transaction.",
    title: "Transaction Accounts",
    // default: { user: [], other: [] },
    examples: [{
      user: [],
      other: [],
    }],
  }),
  withdrawal_amount: Schema.propertySignature(
    Schema.UndefinedOr(AssetSchema)
  ).annotations({
    identifier: "Transaction.WithdrawalAmount",
    description: "The withdrawal amount during the particular transaction.",
    title: "Withdrawal Amount",
    // default: { currency: "", amount: 0 },
    examples: [{
      currency: "ADA",
      amount: .123456,
    }],
  }),
  network_fee: Schema.propertySignature(AssetSchema).annotations({
    identifier: "Transaction.NetworkFee",
    description: "The network fee for the particular transaction.",
    title: "Network Fee",
    // default: { currency: "", amount: 0 },
    examples: [{
      currency: "ADA",
      amount: .123456,
    }],
  }),
  metadata: Schema.propertySignature(
    Schema.Array(
      Schema.Record({
        key: Schema.String.annotations({
          identifier: "Transaction.Metadata.Key",
          description: "The metadata key.",
          title: "Metadata Key",
          // default: "",
          examples: ["label", "json_metadata"],
        }),
        value: Schema.Any.annotations({
          identifier: "Transaction.Metadata.Value",
          description: "The metadata value.",
          title: "Metadata Value",
          // default: null,
          examples: [
            674,
            721,
            {
              msg: [""],
            },
            {
              PolicyID: {
                AssetName: {
                  name: "Token Name",
                  image: "ipfs://QmV0CID",
                },
              },
              version: 2,
            },
          ],
        }),
      }),
    )
  ).annotations({
    identifier: "Transaction.Metadata",
    description: "The metadata attached during the particular transaction, if any.",
    title: "Transaction Metadata",
    // default: [],
    examples: [[]],
  }),
}) {}
export type Transaction = typeof TransactionSchema.Type;

export class InstitutionSchema extends Schema.Struct({
  name: Schema.propertySignature(
    Schema.Literal("Cardano")
  ).annotations({
    identifier: "Institution.Name",
    description: "The name of the institution.",
    title: "Institution Name",
    default: "Cardano",
    // examples: ["Cardano"],
  }),
  network: Schema.propertySignature(
    Schema.Literal("Mainnet", "Preprod", "Preview", "Other")
  ).annotations({
    identifier: "Institution.Network",
    description: "The network of the institution.",
    title: "Institution Network",
    // default: "Mainnet",
    examples: ["Mainnet"],
  }),
}) {}
export type Institution = typeof InstitutionSchema.Type;

export default class ManifestSchema extends Schema.Struct({
  version: Schema.propertySignature(
    Schema.Literal(0)
  ).annotations({
    identifier: "Manifest.Version",
    description: "The manifest format version number.",
    title: "Manifest Version",
    default: 0,
    // examples: [0],
  }),
  id: Schema.propertySignature(Schema.UUID).annotations({
    identifier: "Manifest.ID",
    description: "The manifest UUID.",
    title: "Manifest ID",
    // default: "",
    examples: ["12345678-1234-1234-1234-1234567890ab"],
  }),
  institution: Schema.propertySignature(InstitutionSchema).annotations({
    identifier: "Manifest.Institution",
    description: "The information about the institution.",
    title: "Manifest Institution",
    default: {
      name: "Cardano",
      network: "Mainnet",
    },
    // examples: [{ name: "Cardano", network: "Mainnet" }],
  }),
  transactions: Schema.propertySignature(
    Schema.Array(TransactionSchema)
  ).annotations({
    identifier: "Manifest.Transactions",
    description: "The information about the transactions.",
    title: "Manifest Transactions",
    // default: [],
    examples: [[]],
  }),
}) {
  get placeholder(): Manifest {
    return {
      version: 0,
      id: randomUUID(),
      institution: {
        name: "Cardano",
        network: "Mainnet",
      },
      transactions: [],
    };
  }
}
export type Manifest = typeof ManifestSchema.Type;

// /** EXAMPLE: Creating a JSON Schema for a Manifest
//  */
// const manifest = JSONSchema.make(ManifestSchema);
// console.log(
//   JSON.stringify(manifest, null, 2)
// );
