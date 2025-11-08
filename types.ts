// Fix: Removed circular self-import that caused a declaration conflict.

export interface Identity {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface UserIdentity extends Identity {
  level: number;
  xp: number;
}

export interface User {
  name: string;
  email: string;
  selectedIdentities: UserIdentity[];
  identityStatements: Record<string, string>;
  onboardingCompleted: boolean;
  squadId?: string;
  lastHuddleDate: string | null;
  openToSquadSuggestions?: boolean;
  language?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  identityTag: string;
  cue: string;
  streak: number;
  longestStreak: number;
  lastCompleted: string | null; // ISO date string
  completions: string[]; // Array of ISO date strings
  momentumShields: number;
  comebackChallenge?: {
    isActive: boolean;
    daysRemaining: number;
    originalStreak: number;
  };
  microVersion?: {
    title: string;
  } | null;
}

export interface BlueprintHabit {
  title: string;
  description: string;
  cue: string;
}

export interface JoinRequest {
  userName: string;
  pitch: string;
  approvals: string[];
  denials: string[];
}

export interface KickVote {
    targetUserName: string;
    voters: string[];
}

export interface Squad {
  id: string;
  name: string;
  members: string[]; // User names
  goalIdentity: string;
  sharedMomentum: number;
  pendingRequests: JoinRequest[];
  activeKickVotes: KickVote[];
}

export interface Ripple {
    id: string;
    squadId: string;
    fromUserName: string;
    habitTitle: string;
    identityTag: string;
    timestamp: string; // ISO date string
}

export interface Mission {
  id:string;
  title: string;
  description: string;
  habitId: string;
  targetCompletions: number;
  currentCompletions: number;
  isCompleted: boolean;
  reward: {
      type: 'momentumShield';
      amount: number;
  };
}

export interface DailyHuddleData {
    greeting: string;
    mostImportantHabitId: string;
}
