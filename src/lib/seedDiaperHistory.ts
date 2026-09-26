import type { DiaperEvent, DiaperKind } from "./types";

/**
 * Changes de couches mentionnés en commentaire dans le carnet de tétées
 * (à partir du 19 septembre, quand les parents ont commencé à noter pipi/
 * caca au fil des tétées). "Pas de change" n'est volontairement pas
 * importé : ce n'est pas un événement, c'est l'absence d'un événement.
 * Quand le carnet ne précisait pas pipi ou caca (juste "couche" / "change"
 * générique, ou une couche jugée "bizarre"), l'événement est importé en
 * "both" avec le commentaire original conservé tel quel.
 */

type Entry = [hour: number, minute: number, kind: DiaperKind, comment: string];

const DAYS: Record<string, Entry[]> = {
  "2026-09-20": [
    [2, 56, "both", "Gros pipi, petit caca"],
    [9, 12, "both", "Gros caca et pipi"],
    [12, 35, "both", "Pipi et caca"],
    [14, 24, "dirty", "Petit caca — ventre dur"],
    [17, 41, "dirty", "Mini caca"],
    [21, 26, "wet", "Pipi uniquement"],
  ],
  "2026-09-21": [
    [1, 4, "both", "Couche bizarre (cf photo)"],
    [22, 1, "dirty", "Caca"],
  ],
  "2026-09-22": [[5, 38, "dirty", "Caca"]],
  "2026-09-23": [
    [19, 2, "dirty", "Gros caca un peu bizarre"],
    [22, 11, "dirty", "Très petit caca"],
  ],
  "2026-09-24": [
    [6, 21, "both", "Gros pipi, quasiment pas caca"],
    [19, 13, "dirty", "Assez gros caca"],
  ],
  "2026-09-25": [
    [0, 7, "both", "Gros pipi, petit caca"],
    [10, 31, "both", "Pipi et caca"],
    [20, 48, "both", "Gros pipi et caca"],
  ],
  "2026-09-26": [
    [0, 30, "both", "Pipi et caca"],
    [5, 45, "dirty", "Mini caca"],
    [9, 22, "both", "Pipi et caca"],
    [16, 59, "both", "Pipi et caca"],
  ],
};

function uid(seed: string): string {
  return `seed-diaper-${seed}`;
}

export function buildSeedDiaperEvents(babyId: string): DiaperEvent[] {
  const events: DiaperEvent[] = [];
  const now = new Date().toISOString();

  for (const [date, entries] of Object.entries(DAYS)) {
    entries.forEach(([hour, minute, kind, comment], index) => {
      const time = new Date(`${date}T00:00:00`);
      time.setHours(hour, minute, 0, 0);
      events.push({
        id: uid(`${date}-${index}`),
        babyId,
        kind,
        time: time.toISOString(),
        comment,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  return events;
}
