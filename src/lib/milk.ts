import type { MilkEntry } from "./types";

/**
 * Conservation du lait maternel tiré — repères usuels :
 * - à température ambiante : ~4h à partir du tirage
 * - au réfrigérateur : ~48h à partir de la mise au frigo
 * Ce sont des repères généraux et prudents, pas une garantie médicale —
 * en cas de doute, se référer aux consignes de la maternité/pédiatre.
 */
export const ROOM_TEMP_HOURS = 4;
export const FRIDGE_HOURS = 48;

export type MilkLocation = "room" | "fridge";

export interface MilkStatus {
  location: MilkLocation;
  expiresAt: string; // ISO datetime
  minutesLeft: number; // can be negative once expired
  expired: boolean;
}

export function getMilkStatus(entry: MilkEntry, now: number = Date.now()): MilkStatus {
  if (entry.fridgedAt) {
    const expiresAt = new Date(entry.fridgedAt).getTime() + FRIDGE_HOURS * 3600_000;
    return {
      location: "fridge",
      expiresAt: new Date(expiresAt).toISOString(),
      minutesLeft: (expiresAt - now) / 60000,
      expired: expiresAt <= now,
    };
  }
  const expiresAt = new Date(entry.pumpedAt).getTime() + ROOM_TEMP_HOURS * 3600_000;
  return {
    location: "room",
    expiresAt: new Date(expiresAt).toISOString(),
    minutesLeft: (expiresAt - now) / 60000,
    expired: expiresAt <= now,
  };
}
