import { readJSON, writeJSON } from "./storage";
import type {
  ActiveFeeding,
  ActiveSleep,
  Baby,
  Breast,
  FeedingSession,
  SleepSession,
} from "./types";

const KEYS = {
  babies: "bb:babies",
  feedingSessions: "bb:feeding_sessions",
  activeFeeding: "bb:active_feeding",
  sleepSessions: "bb:sleep_sessions",
  activeSleep: "bb:active_sleep",
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Baby profile ----------

const DEFAULT_BABY: Baby = {
  id: "raphael",
  firstName: "Raphaël",
  birthDate: "2026-09-06",
  createdAt: new Date().toISOString(),
};

export function getBabies(): Baby[] {
  return readJSON<Baby[]>(KEYS.babies, []);
}

export function getActiveBaby(): Baby {
  const babies = getBabies();
  if (babies.length > 0) return babies[0];
  writeJSON(KEYS.babies, [DEFAULT_BABY]);
  return DEFAULT_BABY;
}

export function updateBaby(baby: Baby): void {
  const babies = getBabies().map((b) => (b.id === baby.id ? baby : b));
  writeJSON(KEYS.babies, babies.length ? babies : [baby]);
  notify();
}

// ---------- Feeding sessions ----------

export function getFeedingSessions(babyId: string): FeedingSession[] {
  return readJSON<FeedingSession[]>(KEYS.feedingSessions, []).filter(
    (s) => s.babyId === babyId
  );
}

function saveAllSessions(sessions: FeedingSession[]) {
  writeJSON(KEYS.feedingSessions, sessions);
  notify();
}

export function addFeedingSession(
  babyId: string,
  breast: Breast,
  startTime: string,
  endTime: string
): FeedingSession {
  const durationSeconds = Math.max(
    0,
    Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
  );
  const session: FeedingSession = {
    id: uid(),
    babyId,
    breast,
    startTime,
    endTime,
    durationSeconds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const all = readJSON<FeedingSession[]>(KEYS.feedingSessions, []);
  all.push(session);
  saveAllSessions(all);
  return session;
}

export function updateFeedingSession(
  id: string,
  patch: Partial<Pick<FeedingSession, "breast" | "startTime" | "endTime">>
): void {
  const all = readJSON<FeedingSession[]>(KEYS.feedingSessions, []);
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const merged = { ...all[idx], ...patch };
  merged.durationSeconds = Math.max(
    0,
    Math.round(
      (new Date(merged.endTime).getTime() - new Date(merged.startTime).getTime()) / 1000
    )
  );
  merged.updatedAt = new Date().toISOString();
  all[idx] = merged;
  saveAllSessions(all);
}

export function deleteFeedingSession(id: string): void {
  const all = readJSON<FeedingSession[]>(KEYS.feedingSessions, []);
  saveAllSessions(all.filter((s) => s.id !== id));
}

// ---------- Active (in-progress) feeding timer ----------
// Stored as a real start timestamp (not a counter) so it survives the app
// being backgrounded, the phone being locked, or a page reload: duration is
// always `now - startTime`, never an incremented counter that can drift or
// pause when the tab is suspended.

export function getActiveFeeding(): ActiveFeeding | null {
  return readJSON<ActiveFeeding | null>(KEYS.activeFeeding, null);
}

export function startFeeding(babyId: string, breast: Breast): ActiveFeeding {
  const active: ActiveFeeding = { babyId, breast, startTime: new Date().toISOString() };
  writeJSON(KEYS.activeFeeding, active);
  notify();
  return active;
}

/**
 * Stops whatever feeding is currently active (if any) and records it as a
 * session. Used both for "stop this breast" and for "switch breast", which
 * guarantees only one timer ever runs at once with zero data loss.
 */
export function stopActiveFeeding(): FeedingSession | null {
  const active = getActiveFeeding();
  if (!active) return null;
  writeJSON(KEYS.activeFeeding, null);
  const session = addFeedingSession(
    active.babyId,
    active.breast,
    active.startTime,
    new Date().toISOString()
  );
  return session;
}

/** Switches to the other breast in one atomic step: stop+save current, start new. */
export function switchFeeding(babyId: string, breast: Breast): ActiveFeeding {
  stopActiveFeeding();
  return startFeeding(babyId, breast);
}

export function discardActiveFeeding(): void {
  writeJSON(KEYS.activeFeeding, null);
  notify();
}

// ---------- Sleep sessions ----------

export function getSleepSessions(babyId: string): SleepSession[] {
  return readJSON<SleepSession[]>(KEYS.sleepSessions, []).filter((s) => s.babyId === babyId);
}

function saveAllSleepSessions(sessions: SleepSession[]) {
  writeJSON(KEYS.sleepSessions, sessions);
  notify();
}

export function addSleepSession(babyId: string, startTime: string, endTime: string): SleepSession {
  const durationSeconds = Math.max(
    0,
    Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
  );
  const session: SleepSession = {
    id: uid(),
    babyId,
    startTime,
    endTime,
    durationSeconds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const all = readJSON<SleepSession[]>(KEYS.sleepSessions, []);
  all.push(session);
  saveAllSleepSessions(all);
  return session;
}

export function updateSleepSession(
  id: string,
  patch: Partial<Pick<SleepSession, "startTime" | "endTime">>
): void {
  const all = readJSON<SleepSession[]>(KEYS.sleepSessions, []);
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const merged = { ...all[idx], ...patch };
  merged.durationSeconds = Math.max(
    0,
    Math.round(
      (new Date(merged.endTime).getTime() - new Date(merged.startTime).getTime()) / 1000
    )
  );
  merged.updatedAt = new Date().toISOString();
  all[idx] = merged;
  saveAllSleepSessions(all);
}

export function deleteSleepSession(id: string): void {
  const all = readJSON<SleepSession[]>(KEYS.sleepSessions, []);
  saveAllSleepSessions(all.filter((s) => s.id !== id));
}

// ---------- Active (in-progress) sleep timer ----------
// Same real-timestamp approach as feeding: duration is always `now - startTime`.

export function getActiveSleep(): ActiveSleep | null {
  return readJSON<ActiveSleep | null>(KEYS.activeSleep, null);
}

export function startSleep(babyId: string): ActiveSleep {
  const active: ActiveSleep = { babyId, startTime: new Date().toISOString() };
  writeJSON(KEYS.activeSleep, active);
  notify();
  return active;
}

export function stopActiveSleep(): SleepSession | null {
  const active = getActiveSleep();
  if (!active) return null;
  writeJSON(KEYS.activeSleep, null);
  return addSleepSession(active.babyId, active.startTime, new Date().toISOString());
}

/**
 * The most recent wake-up moment: either now (if asleep) or the end of the
 * last recorded sleep session. Used to compute "awake for X" for the
 * age-aware wake-window message.
 */
export function getLastWakeTime(babyId: string): string | null {
  const sessions = getSleepSessions(babyId).sort((a, b) => b.endTime.localeCompare(a.endTime));
  return sessions[0]?.endTime ?? null;
}
