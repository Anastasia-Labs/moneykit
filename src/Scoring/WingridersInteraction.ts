import { ScoringSvc } from "../Domain/Types";

import { WingridersDefaultFallback } from "./WingridersInteraction/WingridersDefaultFallback";
import { WingridersHarvestTx } from "./WingridersInteraction/WingridersHarvestTx";
import { WingridersLiquidityRemovalCreation } from "./WingridersInteraction/WingridersLiquidityRemovalCreation";
import { WingridersLiquidityRemovalTx } from "./WingridersInteraction/WingridersLiquidityRemovalTx";
import { WingridersSwapCreation } from "./WingridersInteraction/WingridersSwapCreation";
import { WingridersWithdrawLpTx } from "./WingridersInteraction/WingridersWithdrawLpTx";

export const Wingriders: ScoringSvc = {
  scoring: [
    WingridersSwapCreation.score,
    WingridersLiquidityRemovalCreation.score,
    WingridersLiquidityRemovalTx.score,
    WingridersWithdrawLpTx.score,
    WingridersHarvestTx.score,
  ],
  fallback: WingridersDefaultFallback.score,
};
