import { AddressDetails } from "@lucid-evolution/lucid";
import { Transaction } from "../Domain/Manifest";
import { ScoringFn, ScoringSvc, TransactionScore } from "../Domain/Types";
import { AddressInfo, TransactionInfo, TransactionUTXOs } from "../Service/Blockfrost";
import { Wingriders } from "./WingridersInteraction";
import { Effect } from "effect";
import { NonScriptInteraction } from "./NonScriptInteraction";

const LOOKUP: Record<string, ScoringSvc> = {
  Wingriders,
};

export const Scoring = {
  calcConfidenceScoreOf:
    (
      intermediaryTx: Transaction,
      probableProjects: string[],
      addressInfo: AddressInfo,
      addressDetails: AddressDetails,
      txInfo: TransactionInfo,
      txUTXOs: TransactionUTXOs,
    ) =>
      Effect.gen(function* () {
        let tx: Transaction;

        const projectConfidence =
          yield* Effect.all(
            probableProjects.length
              ? probableProjects.map(
                (project) =>
                  confidenceOf(
                    intermediaryTx,
                    LOOKUP[project]?.scoring ?? [],
                    99,
                    addressInfo,
                    addressDetails,
                    txInfo,
                    txUTXOs,
                  )
              )
              : [confidenceOf(
                intermediaryTx,
                NonScriptInteraction.scoring,
                99,
                addressInfo,
                addressDetails,
                txInfo,
                txUTXOs,
              )]
          );

        // maybe multiple dApps transactions are composed into this 1 transaction,
        // in the future we can take the 2nd and 3rd confidence as well that is why
        // right now we're sorting this, even though only the highest one is taken
        // at the moment
        const confidenceDesc =
          projectConfidence.sort(
            (l, r) =>
              (r.confidence ?? 0) - (l.confidence ?? 0)
          );

        const highestConfidence = confidenceDesc[0];
        // if the highest confidence is below threshold (ie, 25-50),
        // then use fallback because the description is likely to be wrong
        if (highestConfidence.confidence === null || highestConfidence.confidence < 40) {
          const fallbackConfidence =
            yield* Effect.all(
              probableProjects.length
                ? probableProjects.map(
                  (project) =>
                    confidenceOf(
                      intermediaryTx,
                      LOOKUP[project] ? [LOOKUP[project].fallback] : [],
                      99,
                      addressInfo,
                      addressDetails,
                      txInfo,
                      txUTXOs,
                    )
                )
                : [confidenceOf(
                  intermediaryTx,
                  [NonScriptInteraction.fallback],
                  0,
                  addressInfo,
                  addressDetails,
                  txInfo,
                  txUTXOs,
                )]
            );

          tx = { ...intermediaryTx, ...fallbackConfidence[0] };
        } else {
          tx = { ...intermediaryTx, ...highestConfidence };
        }
        return tx;
      })
};

const confidenceOf = (
  intermediaryTx: Transaction,
  scoring: ScoringFn[],
  maxConfidence: number,
  addressInfo: AddressInfo,
  addressDetails: AddressDetails,
  txInfo: TransactionInfo,
  txUTXOs: TransactionUTXOs,
) =>
  Effect.gen(function* () {
    let tx: Transaction;

    if (!scoring.length) {
      tx = { ...intermediaryTx, confidence: null };
      return tx;
    }

    const scores =
      yield* Effect.all(
        scoring.map(
          (scoreOf) =>
            scoreOf(
              intermediaryTx,
              addressInfo,
              addressDetails,
              txInfo,
              txUTXOs,
            )
        )
      );

    // in the future we can provide 2nd or 3rd altenative scores
    const scoreDesc =
      scores.sort(
        (l, r) =>
          r.score - l.score
      );

    const { type, description, score }: TransactionScore = scoreDesc[0];
    const adjustedScore = (score < .9) ? (score / 2) : ((score - .9) * 5 + .5);
    const confidence = Math.round(adjustedScore * maxConfidence);

    tx = { ...intermediaryTx, type, description, confidence };
    return tx;
  });
