import { ScoringSvc } from "../Domain/Types";

import { WingridersDefaultFallback } from "./WingridersInteraction/WingridersDefaultFallback";
import { WingridersLiquidityRemovalCreation } from "./WingridersInteraction/WingridersLiquidityRemovalCreation";
import { WingridersLiquidityRemovalTx } from "./WingridersInteraction/WingridersLiquidityRemovalTx";

export const Wingriders: ScoringSvc = {
  scoring: [
    WingridersLiquidityRemovalCreation.score,
    WingridersLiquidityRemovalTx.score,
  ],
  fallback: WingridersDefaultFallback.score,
};
