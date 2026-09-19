import { bucketForAge } from "./sleepMatrix";
import type { SleepSession } from "./types";

/**
 * Prédiction du prochain endormissement — PAS une reproduction de
 * l'algorithme propriétaire de Napper (non public, non accessible). C'est
 * un moteur équivalent dans l'esprit : il mélange les repères d'âge
 * (sourcés dans sleepMatrix.ts) avec le rythme personnel de Raphaël,
 * appris à partir de ses propres siestes/nuits déjà enregistrées, pour
 * donner une heure concrète — pas juste "bientôt".
 *
 * Plus on a de données récentes sur ce bébé précis, plus la prédiction
 * s'appuie sur son propre rythme plutôt que sur la moyenne générale.
 */

export interface SleepPrediction {
  recommended: string; // ISO datetime — heure conseillée pour l'endormissement
  earliest: string; // ISO datetime
  latest: string; // ISO datetime
  windowMinutes: number; // fenêtre d'éveil effective utilisée
  sampleSize: number; // nombre d'intervalles personnels utilisés
  basis: "personal" | "blend" | "age";
}

const MAX_SAMPLES = 8;
const LOOKBACK_HOURS = 96;
const MIN_GAP_MINUTES = 10;
const MAX_GAP_MINUTES = 400;

/** Durées d'éveil réelles entre les sommeils récents de ce bébé. */
function recentAwakeIntervals(sessions: SleepSession[]): number[] {
  const sorted = [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const cutoff = Date.now() - LOOKBACK_HOURS * 3600_000;
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = new Date(sorted[i - 1].endTime).getTime();
    const nextStart = new Date(sorted[i].startTime).getTime();
    if (prevEnd < cutoff) continue;
    const gapMinutes = (nextStart - prevEnd) / 60000;
    if (gapMinutes >= MIN_GAP_MINUTES && gapMinutes <= MAX_GAP_MINUTES) {
      gaps.push(gapMinutes);
    }
  }
  return gaps.slice(-MAX_SAMPLES);
}

export function predictNextSleep(
  ageDays: number,
  sessions: SleepSession[],
  lastWakeIso: string
): SleepPrediction {
  const bucket = bucketForAge(ageDays);
  const [minW, maxW] = bucket.wakeWindowMinutes;
  const ageMid = (minW + maxW) / 2;

  const intervals = recentAwakeIntervals(sessions);
  let windowMinutes = ageMid;
  let basis: SleepPrediction["basis"] = "age";

  if (intervals.length >= 3) {
    const personalAvg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    // Clamp to a sane range around the age bucket so one bad outlier
    // (e.g. a missed log) can't drag the prediction way off.
    const clamped = Math.min(Math.max(personalAvg, minW * 0.6), maxW * 1.4);
    const weight = Math.min(1, intervals.length / 6);
    windowMinutes = clamped * weight + ageMid * (1 - weight);
    basis = weight >= 0.55 ? "personal" : "blend";
  }

  const lastWake = new Date(lastWakeIso).getTime();
  const recommendedMs = lastWake + windowMinutes * 60000;
  const spread = Math.max(10, windowMinutes * 0.15);

  return {
    recommended: new Date(recommendedMs).toISOString(),
    earliest: new Date(recommendedMs - spread * 60000).toISOString(),
    latest: new Date(recommendedMs + spread * 60000).toISOString(),
    windowMinutes: Math.round(windowMinutes),
    sampleSize: intervals.length,
    basis,
  };
}
