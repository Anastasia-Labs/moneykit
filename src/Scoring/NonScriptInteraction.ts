import { ScoringFn } from "../Domain/Types";

import { CatalystDeregistration } from "./NonScriptInteraction/CatalystDeregistration";
import { CatalystRegistration } from "./NonScriptInteraction/CatalystRegistration";
import { MultiStakeDelegation } from "./NonScriptInteraction/MultiStakeDelegation";
import { ReceiveAda } from "./NonScriptInteraction/ReceiveAda";
import { ReceiveToken } from "./NonScriptInteraction/ReceiveToken";
// import { SelfTransaction } from "./NonScriptInteraction/SelfTransaction";
import { SendAda } from "./NonScriptInteraction/SendAda";
import { SendToken } from "./NonScriptInteraction/SendToken";
import { SetupCollateral } from "./NonScriptInteraction/SetupCollateral";
import { StakeDelegation } from "./NonScriptInteraction/StakeDelegation";
import { StakeRegistration } from "./NonScriptInteraction/StakeRegistration";
import { TokenMinting } from "./NonScriptInteraction/TokenMinting";
import { UnknownActivity } from "./NonScriptInteraction/UnknownActivity";

export const Scoring: ScoringFn[] = [
  ReceiveAda.score,
  SendAda.score,
  ReceiveToken.score,
  SendToken.score,
  TokenMinting.score,
  CatalystRegistration.score,
  CatalystDeregistration.score,
  StakeRegistration.score,
  StakeDelegation.score,
  MultiStakeDelegation.score,
  SetupCollateral.score,
  // SelfTransaction.score,
];

export const Fallback: ScoringFn =
  UnknownActivity.score;
