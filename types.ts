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
  id: string;
  name: string;
  email: string;
  selectedIdentities: UserIdentity[];
  identityStatements: Record<string, string>;
  onboardingCompleted: boolean;
  lastHuddleDate: string | null;
  language: string;
  voicePreference?: string;
  subscription: {
    plan: 'free' | 'pro' | 'team';
  };
  dailyTranslations: {
    date: string;
    count: number;
  };
  consent: {
    privacyPolicy: string;
    termsOfService: string;
  };
  dailyDebriefs: DailyDebrief[];
  momentumCharges: number;
  squadId?: string;
  teamId?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  identityTag: string;
  cue: string;
  streak: number;
  longestStreak: number;
  lastCompleted: string | null;
  completions: string[]; // Array of ISO date strings
  momentumShields: number;
  missedDays: number;
}

export interface BlueprintHabit {
  title: string;
  description: string;
  cue: string;
}

export interface DailyHuddleData {
    greeting: string;
    mostImportantHabitId: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    targetHabitId: string;
    targetCompletions: number;
    currentCompletions: number;
}

export interface SquadMember {
    userId: string;
    name: string;
    totalCompletions: number;
}

export interface Squad {
    id: string;
    name: string;
    goalIdentity: string;
    members: SquadMember[];
    sharedMomentum: number;
}

export interface SquadQuest {
    id: string;
    title: string;
    points: number;
    isCompleted: boolean;
    completedBy?: string; // name of member
}

export interface SquadSaga {
    title: string;
    chapter: number;
    lore: string;
    milestones: { description: string; isCompleted: boolean }[];
    boss: {
        name: string;
        hp: number;
        maxHp: number;
    };
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
    isHuddleMessage?: boolean;
}

export interface MentorIntervention {
    habitId: string;
    message: string;
    microHabit: {
        title: string;
    };
}

export interface TeamMember {
    userId: string;
    name: string;
    email: string;
    totalCompletions: number;
}

export interface Team {
    id: string;
    name: string;
    members: TeamMember[];
    subscriptionStatus: 'active' | 'inactive';
}

export interface TeamChallenge {
    id: string;
    teamId: string;
    title: string;
    description: string;
    habitCategory: string; // e.g., 'Creator', 'Athlete'
    targetCompletions: number;
    currentCompletions: number;
    isActive: boolean;
}

export interface DailyDebrief {
    date: string; // YYYY-MM-DD
    mood: 'terrible' | 'bad' | 'okay' | 'good' | 'great';
    guidedAnswers: Record<string, string>;
    privateNote: string;
    isShared: boolean;
}

export interface Financials {
    revenuePerProUser: number;
    revenuePerTeamMember: number;
    monthlyCosts: number;
}

export interface AssistRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterIdentity: string;
  habitTitle: string;
  timestamp: number;
}
