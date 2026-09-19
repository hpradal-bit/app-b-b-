/**
 * Repères de sommeil par âge — PAS des règles médicales.
 *
 * Ces plages sont des repères larges et fréquemment observés, croisés à
 * partir de sources reconnues :
 * - INSV (Institut National du Sommeil et de la Vigilance) — institut-sommeil-vigilance.org
 * - Réseau Morphée (réseau de santé sommeil, Île-de-France) — sommeilenfant.reseau-morphee.fr
 * - National Sleep Foundation (consensus 2015, Hirshkowitz et al.) — durées totales par tranche d'âge
 *
 * La variabilité individuelle est très importante chez le nourrisson : ces
 * chiffres servent à donner un contexte, jamais une prescription. L'UI ne
 * doit jamais afficher ces plages comme des objectifs à atteindre.
 */

export interface SleepAgeBucket {
  maxDays: number; // bucket applies while age in days <= maxDays
  label: string;
  totalSleepHours: [number, number];
  wakeWindowMinutes: [number, number];
  napsPerDay: [number, number];
  note: string;
}

export const SLEEP_MATRIX: SleepAgeBucket[] = [
  {
    maxDays: 14,
    label: "0–2 semaines",
    totalSleepHours: [14, 19],
    wakeWindowMinutes: [40, 60],
    napsPerDay: [5, 8],
    note:
      "À cet âge, beaucoup de nouveau-nés dorment par cycles courts (~2h), sans distinguer jour et nuit.",
  },
  {
    maxDays: 28,
    label: "2–4 semaines",
    totalSleepHours: [14, 18],
    wakeWindowMinutes: [45, 75],
    napsPerDay: [4, 7],
    note: "Le rythme reste très irrégulier — c'est normal à cet âge.",
  },
  {
    maxDays: 56,
    label: "1–2 mois",
    totalSleepHours: [14, 17],
    wakeWindowMinutes: [60, 90],
    napsPerDay: [4, 6],
    note: "Certains bébés commencent à allonger une période de sommeil, souvent en fin de nuit.",
  },
  {
    maxDays: 84,
    label: "2–3 mois",
    totalSleepHours: [13, 16],
    wakeWindowMinutes: [75, 120],
    napsPerDay: [3, 5],
    note: "L'alternance jour/nuit commence fréquemment à se dessiner vers cet âge.",
  },
  {
    maxDays: 120,
    label: "3–4 mois",
    totalSleepHours: [12, 16],
    wakeWindowMinutes: [90, 150],
    napsPerDay: [3, 4],
    note: "Une période de régression du sommeil est fréquemment observée autour de 4 mois.",
  },
  {
    maxDays: 150,
    label: "4–5 mois",
    totalSleepHours: [12, 15],
    wakeWindowMinutes: [105, 165],
    napsPerDay: [3, 4],
    note: "Les besoins varient fortement d'un bébé à l'autre à cet âge.",
  },
  {
    maxDays: 183,
    label: "5–6 mois",
    totalSleepHours: [12, 15],
    wakeWindowMinutes: [120, 180],
    napsPerDay: [2, 4],
    note: "Une sieste peut commencer à disparaître naturellement chez certains bébés.",
  },
];

const FALLBACK: SleepAgeBucket = {
  maxDays: Infinity,
  label: "6 mois et plus",
  totalSleepHours: [11, 14],
  wakeWindowMinutes: [150, 240],
  napsPerDay: [2, 3],
  note: "Les besoins varient fortement selon les bébés à cet âge.",
};

export function bucketForAge(ageDays: number): SleepAgeBucket {
  return SLEEP_MATRIX.find((b) => ageDays <= b.maxDays) ?? FALLBACK;
}

export type DrowsinessLevel = "just_woke" | "watch_soon" | "watch_now" | "overdue";

export interface DrowsinessInfo {
  level: DrowsinessLevel;
  message: string;
  minutesAwake: number;
}

/**
 * Contextual (not prescriptive) read on how long the baby has been awake
 * relative to typical wake windows for their age. Intentionally never says
 * "put baby to bed at Xh" — only "here's roughly where you are".
 */
export function getDrowsinessInfo(ageDays: number, minutesAwake: number): DrowsinessInfo {
  const bucket = bucketForAge(ageDays);
  const [min, max] = bucket.wakeWindowMinutes;

  if (minutesAwake < min * 0.6) {
    return {
      level: "just_woke",
      minutesAwake,
      message: "Raphaël vient de se réveiller, tout va bien pour l'instant.",
    };
  }
  if (minutesAwake < min) {
    return {
      level: "watch_soon",
      minutesAwake,
      message: "Raphaël pourrait commencer à montrer des signes de fatigue prochainement.",
    };
  }
  if (minutesAwake <= max) {
    return {
      level: "watch_now",
      minutesAwake,
      message: "C'est peut-être le bon moment pour observer les signes de fatigue (bâillements, regard qui se perd, agitation).",
    };
  }
  return {
    level: "overdue",
    minutesAwake,
    message:
      "Raphaël est éveillé depuis plus longtemps que la fenêtre habituelle pour son âge — il pourrait être surstimulé, ce qui peut rendre l'endormissement plus difficile.",
  };
}
