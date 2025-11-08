
export interface Identity {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface User {
  name: string;
  email: string;
  selectedIdentities: Identity[];
  identityStatements: Record<string, string>;
  onboardingCompleted: boolean;
}

export interface Habit {
  id: string;
  title: string;
  identityTag: string;
  cue: string;
  streak: number;
  longestStreak: number;
  lastCompleted: string | null; // ISO date string
  completions: string[]; // Array of ISO date strings
}
