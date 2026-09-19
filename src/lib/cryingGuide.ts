/**
 * Aide non-diagnostique face aux pleurs — PAS un outil médical.
 *
 * Sources croisées :
 * - Manuel MSD / Merck Manuals, édition professionnelle, section "Pleurs
 *   chez l'enfant" — msdmanuals.com/fr/professional
 * - Santé.fr (service public d'information santé) — "Coliques et pleurs
 *   du nourrisson, comment les décoder ?"
 * - Définition des coliques du nourrisson (critères de Wessel) : pleurs
 *   >3h/jour, >3 jours/semaine, >3 semaines, chez un bébé de ≤4 mois par
 *   ailleurs en bonne santé — Manuel MSD
 * - Fièvre : une fièvre ≥38°C chez un nourrisson de moins de 3 mois est
 *   considérée comme une urgence médicale systématique (sources santé
 *   grand public françaises recoupées)
 *
 * Règle absolue de ce module : jamais de diagnostic, jamais de nom de
 * maladie affirmé. Toujours "plusieurs causes possibles", jamais "votre
 * bébé a...".
 */

export interface RedFlag {
  id: string;
  label: string;
}

export const RED_FLAGS: RedFlag[] = [
  { id: "fever", label: "Fièvre (≥ 38°C), surtout avant 3 mois" },
  { id: "breathing", label: "Difficulté à respirer, respiration rapide ou sifflante" },
  { id: "lethargy", label: "Anormalement mou, très difficile à réveiller" },
  { id: "feeding_refusal", label: "Refuse de s'alimenter de façon répétée" },
  { id: "vomiting", label: "Vomissements inhabituels ou en jet" },
  { id: "color", label: "Teint inhabituel (très pâle, bleuté, jaunâtre)" },
  { id: "rash", label: "Éruption cutanée qui ne blanchit pas à la pression" },
  { id: "inconsolable", label: "Cri aigu et pleurs inconsolables depuis plus de 2h" },
];

export interface CheckItem {
  id: string;
  label: string;
}

export const CHECK_ITEMS: CheckItem[] = [
  { id: "rooting", label: "Il porte les mains à la bouche / cherche à téter" },
  { id: "wriggling", label: "Il se tortille ou ramène les jambes vers le ventre" },
  { id: "temperature", label: "Il semble avoir trop chaud ou trop froid" },
  { id: "wants_held", label: "Il se calme un peu quand on le porte" },
  { id: "burp", label: "Il n'a pas encore fait de rot depuis la dernière tétée" },
  { id: "overstim", label: "Il sort d'un moment bruyant ou très stimulant" },
];

export interface CauseHint {
  label: string;
  reason: string;
}

interface CauseContext {
  minutesSinceLastFeeding: number | null;
  minutesSinceLastDiaper: number | null;
  minutesAwake: number;
  checkedIds: string[];
}

const CHECK_TO_CAUSE: Record<string, CauseHint> = {
  rooting: { label: "Faim", reason: "il cherche activement à téter" },
  wriggling: {
    label: "Inconfort digestif",
    reason: "les tortillements peuvent évoquer un inconfort digestif ou des gaz",
  },
  temperature: { label: "Inconfort thermique", reason: "trop chaud ou trop froid" },
  wants_held: { label: "Besoin de proximité", reason: "il se rassure au contact" },
  burp: { label: "Rot / air avalé", reason: "de l'air non évacué peut gêner" },
  overstim: { label: "Surstimulation", reason: "un environnement stimulant peut fatiguer" },
};

/**
 * Ranks plausible, non-diagnostic causes from real app context (time since
 * last feeding/diaper/wake) plus whatever the parent just checked. Never
 * asserts a single cause — always plural, always "possible".
 */
export function buildCauseHints(ctx: CauseContext): CauseHint[] {
  const hints: CauseHint[] = [];

  if (ctx.minutesSinceLastFeeding !== null && ctx.minutesSinceLastFeeding >= 120) {
    hints.push({
      label: "Faim",
      reason: `la dernière tétée remonte à ${Math.floor(ctx.minutesSinceLastFeeding / 60)} h`,
    });
  }
  if (ctx.minutesSinceLastDiaper === null || ctx.minutesSinceLastDiaper >= 150) {
    hints.push({
      label: "Couche",
      reason:
        ctx.minutesSinceLastDiaper === null
          ? "aucun change enregistré aujourd'hui"
          : "le dernier change commence à dater",
    });
  }
  if (ctx.minutesAwake >= 90) {
    hints.push({
      label: "Fatigue",
      reason: `éveillé depuis ${ctx.minutesAwake} min, possiblement surstimulé`,
    });
  }

  for (const id of ctx.checkedIds) {
    const hint = CHECK_TO_CAUSE[id];
    if (hint && !hints.some((h) => h.label === hint.label)) hints.push(hint);
  }

  return hints;
}
