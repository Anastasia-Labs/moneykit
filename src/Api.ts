import { HttpApi, OpenApi } from "@effect/platform";
import { DescriberAPI } from "./Transaction/Api";

export class Api extends HttpApi.make("TransactionManifestTool")
  .add(DescriberAPI)
  .annotate(OpenApi.Title, "Transaction Manifest Tool")
{}
