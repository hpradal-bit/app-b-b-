export interface AgeInfo {
  days: number;
  weeks: number;
  months: number;
  label: string; // e.g. "13 jours", "2 semaines", "1 mois"
}

/**
 * Age is derived purely from birthDate + now — never stored/edited manually,
 * so every screen stays in sync automatically as the baby grows.
 */
export function computeAge(birthDate: string, now: Date = new Date()): AgeInfo {
  const birth = new Date(birthDate + "T00:00:00");
  const start = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.round((today.getTime() - start.getTime()) / msPerDay));
  const weeks = Math.floor(days / 7);

  let months =
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  if (today.getDate() < start.getDate()) months -= 1;
  months = Math.max(0, months);

  let label: string;
  if (days < 1) {
    label = "né aujourd'hui";
  } else if (months >= 1) {
    label = months === 1 ? "1 mois" : `${months} mois`;
  } else if (weeks >= 1) {
    label = weeks === 1 ? "1 semaine" : `${weeks} semaines`;
  } else {
    label = days === 1 ? "1 jour" : `${days} jours`;
  }

  return { days, weeks, months, label };
}
