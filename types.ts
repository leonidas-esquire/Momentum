
export interface Identity {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Habit {
  id: string;
  title: string;
  identityTag: string;
  cue: string;
  streak: number;
  longestStreak: number;
  lastCompleted: string | null; // ISO string
  completions: string[]; // Array of ISO strings
}

export interface User {
  name: string;
  selectedIdentities: Identity[];
  identityStatements: Record<string, string>;
  onboardingCompleted: boolean;
}

export type AppState = 'ONBOARDING' | 'DASHBOARD' | 'HABIT_BUILDER' | 'WEEKLY_REVIEW';
