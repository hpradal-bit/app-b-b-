export type Breast = "left" | "right" | "unknown";

export interface Baby {
  id: string;
  firstName: string;
  birthDate: string; // ISO date, e.g. "2026-09-06"
  createdAt: string;
}

export interface FeedingSession {
  id: string;
  babyId: string;
  breast: Breast;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveFeeding {
  babyId: string;
  breast: Breast;
  startTime: string; // ISO datetime
}

export interface SleepSession {
  id: string;
  babyId: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSleep {
  babyId: string;
  startTime: string; // ISO datetime
}

export type DiaperKind = "wet" | "dirty" | "both";

export interface DiaperEvent {
  id: string;
  babyId: string;
  kind: DiaperKind;
  time: string; // ISO datetime
  createdAt: string;
  updatedAt: string;
}

export interface CryingEvent {
  id: string;
  babyId: string;
  time: string; // ISO datetime
  causes: string[]; // labels the parent identified as plausible, informational only
  createdAt: string;
}
