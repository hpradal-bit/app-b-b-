export type Breast = "left" | "right";

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
