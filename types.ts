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
  id: string; // Added user ID for team admin reference
  name: string;
  email: string;
  selectedIdentities: UserIdentity[];
  identityStatements: Record<string, string>;
  onboardingCompleted: boolean;
  squadId?: string;
  teamId?: string; // New: Link user to a team
  isAdmin?: boolean; // New: Designate user as a team admin
  lastHuddleDate: string | null;
  openToSquadSuggestions?: boolean;
  language: string;
  voicePreference?: string;
  subscription: {
    plan: 'free' | 'pro' | 'team';
    expires?: string;
  };
  dailyTranslations: {
    date: string;
    count: number;
  };
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

export interface SquadQuest {
    id: string;
    title: string;
    points: number;
    isCompleted: boolean;
    completedBy: string | null; // User name
}

export interface Squad {
  id:string;
  name: string;
  members: string[]; // User names
  goalIdentity: string;
  sharedMomentum: number;
  pendingRequests: JoinRequest[];
  activeKickVotes: KickVote[];
  dailyQuests?: {
      date: string; // ISO date string (YYYY-MM-DD)
      quests: SquadQuest[];
  } | null;
}

export interface Nudge {
    fromUserName: string;
    message: string;
}

export interface Ripple {
    id: string;
    squadId: string;
    fromUserName: string;
    habitTitle: string;
    identityTag: string;
    timestamp: string; // ISO date string
    nudges: Nudge[];
    isQuestCompletion?: boolean;
    questPoints?: number;
}

export interface ChatMessage {
    id: string;
    squadId: string;
    fromUserName: string;
    originalText: string;
    originalLanguage: string; // The language code of the sender
    translations: Record<string, string>; // e.g., { "es": "Hola mundo", "fr": "Bonjour le monde" }
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

// New Types for Momentum for Teams
export interface TeamMember {
    userId: string;
    name: string;
    email: string;
    totalCompletions: number; // For leaderboard, privacy-safe
}

export interface Team {
    id: string;
    name: string;
    adminUserId: string;
    members: TeamMember[];
    subscriptionStatus: 'active' | 'inactive';
}

export interface TeamChallenge {
    id: string;
    teamId: string;
    title: string;
    description: string;
    habitCategory: string; // e.g., "Meditation", "Reading", "Exercise"
    targetCompletions: number;
    currentCompletions: number;
    isActive: boolean;
}
