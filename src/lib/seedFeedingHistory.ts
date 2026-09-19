import type { Breast, FeedingSession } from "./types";

/**
 * Historique réel des tétées de Raphaël, transcrit à partir du carnet tenu
 * par ses parents depuis sa naissance (6 septembre 2026). Importé une seule
 * fois au premier lancement de l'app sur un appareil qui n'a encore aucune
 * donnée, pour ne pas repartir de zéro.
 *
 * Notes de transcription :
 * - Les repas donnés "à la cuillère" (quelques cuillères de lait exprimé,
 *   sans minutage) ne sont pas des tétées chronométrées : ils ne sont pas
 *   importés ici.
 * - Certaines lignes du carnet ne précisaient pas encore le sein utilisé
 *   (surtout les tout premiers jours) : elles sont importées avec
 *   breast: "unknown" — modifiables ensuite depuis la liste des sessions.
 *   Quelques créneaux mélangeaient les deux seins sans indiquer la
 *   répartition exacte ; ils sont eux aussi marqués "unknown" plutôt que
 *   d'inventer une répartition.
 * - Une poignée de totaux quotidiens tapés à la main dans le carnet ne
 *   retombent pas exactement sur la somme des lignes (à quelques minutes
 *   près) : c'est le carnet d'origine, pas une erreur d'import — chaque
 *   session reste éditable dans l'app.
 */

type Entry = [hour: number, minute: number, durationMinutes: number, breast: Breast];

const DAYS: Record<string, Entry[]> = {
  "2026-09-06": [
    [16, 20, 29, "unknown"],
    [23, 22, 32, "unknown"],
  ],
  "2026-09-07": [
    [7, 55, 20, "unknown"],
    [17, 52, 8, "unknown"],
    [18, 10, 20, "unknown"],
    [20, 20, 2, "unknown"],
    [22, 42, 10, "unknown"],
  ],
  "2026-09-08": [
    [2, 58, 2, "unknown"],
    [3, 10, 2, "unknown"],
    [3, 16, 1, "unknown"],
    [4, 28, 39, "unknown"],
    [7, 57, 40, "unknown"],
    [11, 37, 23, "unknown"],
    [14, 51, 27, "unknown"],
    [16, 0, 3, "unknown"],
    [18, 15, 25, "unknown"],
    [21, 56, 29, "unknown"],
    [23, 38, 2, "unknown"],
    [23, 50, 25, "unknown"],
  ],
  "2026-09-09": [
    [3, 33, 31, "unknown"],
    [5, 44, 15, "unknown"],
    [8, 23, 13, "unknown"],
    [9, 47, 8, "unknown"],
    [10, 48, 20, "right"],
    [14, 13, 20, "left"],
    [14, 33, 13, "right"],
    [17, 17, 6, "right"],
    [18, 47, 26, "left"],
    [22, 23, 10, "right"],
    [22, 33, 22, "left"],
  ],
  "2026-09-10": [
    [1, 19, 17, "right"],
    [1, 49, 16, "left"],
    [2, 23, 11, "right"],
    [4, 48, 46, "unknown"],
    [6, 34, 18, "right"],
    [7, 8, 5, "left"],
    [10, 50, 13, "left"],
    [11, 38, 7, "right"],
    [11, 54, 10, "right"],
    [15, 12, 16, "left"],
    [15, 36, 10, "right"],
    [15, 56, 10, "right"],
    [18, 1, 16, "left"],
    [20, 45, 25, "right"],
    [21, 24, 10, "left"],
    [21, 38, 4, "left"],
    [23, 53, 15, "right"],
  ],
  "2026-09-11": [
    [0, 28, 32, "left"],
    [5, 12, 20, "right"],
    [5, 44, 10, "left"],
    [9, 46, 11, "right"],
    [10, 0, 9, "left"],
    [10, 16, 3, "left"],
    [13, 9, 14, "left"],
    [13, 46, 20, "right"],
    [14, 13, 3, "right"],
    [15, 42, 10, "left"],
    [20, 9, 39, "right"],
    [21, 55, 20, "left"],
    [23, 8, 10, "left"],
  ],
  "2026-09-12": [
    [0, 13, 13, "left"],
    [3, 51, 29, "right"],
    [4, 26, 6, "left"],
    [8, 19, 24, "left"],
    [9, 6, 9, "left"],
    [13, 52, 38, "unknown"],
    [14, 32, 5, "unknown"],
    [18, 18, 25, "right"],
    [20, 50, 14, "left"],
    [23, 27, 9, "left"],
    [23, 51, 22, "unknown"],
  ],
  "2026-09-13": [
    [4, 11, 23, "left"],
    [5, 48, 10, "left"],
    [9, 51, 13, "right"],
    [10, 53, 19, "left"],
    [13, 51, 13, "right"],
    [14, 20, 15, "unknown"],
    [19, 26, 14, "left"],
    [20, 12, 21, "right"],
    [22, 54, 16, "left"],
  ],
  "2026-09-14": [
    [3, 36, 11, "right"],
    [4, 6, 12, "left"],
    [7, 55, 20, "left"],
    [8, 36, 15, "right"],
    [12, 23, 18, "right"],
    [16, 38, 7, "right"],
    [16, 47, 8, "right"],
    [18, 22, 15, "left"],
    [21, 9, 20, "right"],
    [21, 50, 10, "left"],
  ],
  "2026-09-15": [
    [0, 49, 15, "left"],
    [1, 28, 15, "right"],
    [4, 28, 30, "left"],
    [8, 29, 11, "right"],
    [12, 25, 30, "left"],
    [16, 30, 25, "right"],
    [19, 34, 29, "left"],
    [23, 43, 17, "right"],
  ],
  "2026-09-16": [
    [2, 52, 20, "left"],
    [3, 55, 9, "left"],
    [6, 36, 16, "right"],
    [10, 20, 28, "left"],
    [12, 47, 35, "right"],
    [15, 28, 14, "left"],
    [19, 54, 26, "right"],
    [23, 20, 25, "left"],
  ],
  "2026-09-17": [
    [2, 48, 10, "right"],
    [3, 9, 12, "left"],
    [7, 12, 10, "right"],
    [7, 34, 8, "right"],
    [11, 9, 18, "right"],
    [13, 49, 20, "right"],
    [14, 32, 5, "right"],
    [19, 29, 29, "left"],
    [23, 12, 20, "right"],
    [23, 51, 5, "left"],
  ],
  "2026-09-18": [
    [3, 31, 18, "left"],
    [4, 9, 5, "right"],
    [5, 49, 19, "left"],
    [11, 3, 27, "right"],
    [14, 0, 14, "left"],
    [18, 40, 25, "right"],
    [20, 29, 9, "left"],
    [20, 48, 13, "left"],
    [23, 16, 16, "left"],
    [23, 52, 17, "right"],
  ],
  "2026-09-19": [
    [1, 48, 15, "left"],
    [2, 53, 11, "right"],
    [3, 8, 10, "right"],
    [6, 3, 12, "left"],
    [12, 57, 27, "left"],
    [14, 32, 6, "right"],
    [14, 39, 11, "left"],
  ],
};

function uid(seed: string): string {
  return `seed-${seed}`;
}

export function buildSeedFeedingSessions(babyId: string): FeedingSession[] {
  const sessions: FeedingSession[] = [];
  const now = new Date().toISOString();

  for (const [date, entries] of Object.entries(DAYS)) {
    entries.forEach(([hour, minute, durationMinutes, breast], index) => {
      const start = new Date(`${date}T00:00:00`);
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      sessions.push({
        id: uid(`${date}-${index}`),
        babyId,
        breast,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationSeconds: durationMinutes * 60,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  return sessions;
}
