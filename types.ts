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

export interface Habit {
  id: string;
  title: string;
  description?: string;
  identityTag: string;
  cue: string;
  streak: number;
  longestStreak: number;
  lastCompleted: string | null;
  completions: string[];
  momentumShields: number;
  comebackChallenge?: {
    isActive: boolean;
    daysRemaining: number;
    originalStreak: number;
  };
  microVersion?: {
    title: string;
  };
}

export interface BlueprintHabit {
  title: string;
  description: string;
  cue: string;
}

export interface DailyDebrief {
    date: string;
    mood: 'terrible' | 'bad' | 'okay' | 'good' | 'great';
    guidedAnswers: Record<string, string>;
    privateNote: string;
    isShared: boolean;
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
  squadId?: string;
  teamId?: string;
  isAdmin?: boolean;
  dailyDebriefs: DailyDebrief[];
  momentumCharges: number;
}

export interface SquadQuest {
    id: string;
    title: string;
    points: number;
    isCompleted: boolean;
    completedBy?: string;
}

export interface SquadSaga {
    title: string;
    chapter: number;
    lore: string;
    milestones: { description: string; isCompleted: boolean; }[];
    boss: { name: string; hp: number; maxHp: number; };
}

export interface Squad {
    id: string;
    name: string;
    members: { userId: string; name: string; }[];
    goalIdentity: string;
    sharedMomentum: number;
    quests: SquadQuest[];
    joinRequests: { userName: string; pitch: string; votes: { [userId: string]: 'approve' | 'deny' } }[];
    kickVotes: { [targetUserName: string]: { [voterUserId: string]: boolean } };
    saga?: SquadSaga;
    nameChangeVote?: {
        proposedName: string;
        proposerId: string;
        proposerName: string;
        votes: { [userId: string]: boolean };
    };
}

export interface Ripple {
    id: string;
    squadId: string;
    authorId: string;
    authorName: string;
    type: 'streak_milestone' | 'comeback' | 'identity_levelup' | 'mission_complete' | 'squad_quest_complete' | 'win_shared' | 'saga_contribution' | 'assist_request';
    message: string;
    timestamp: string;
    nudges: { nudgerName: string; message: string }[];
    isResolved?: boolean;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    habitId: string;
    targetCompletions: number;
    currentCompletions: number;
    isCompleted: boolean;
}

export interface DailyHuddleData {
    greeting: string;
    mostImportantHabitId: string;
}

export interface ChatMessage {
    id: string;
    squadId: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
    isHuddleMessage?: boolean;
}

export interface Team {
    id:string;
    name: string;
    members: {
        userId: string;
        name: string;
        email: string;
        totalCompletions: number;
    }[];
    subscriptionStatus: 'active' | 'inactive';
}

export interface TeamChallenge {
    id:string;
    teamId: string;
    title: string;
    description: string;
    habitCategory: string;
    targetCompletions: number;
    currentCompletions: number;
    isActive: boolean;
}

export interface Financials {
    revenuePerProUser: number;
    revenuePerTeamMember: number;
    monthlyCosts: number;
}

export interface MentorIntervention {
    habitId: string;
    message: string;
    microHabit: {
        title: string;
    };
}

export interface ChapterUnlockData {
    identityName: string;
    newLevel: number;
    chapterTitle: string;
    lore: string;
    masteryMission: {
        title: string;
        description: string;
        habitId: string;
        targetCompletions: number;
    };
    evolvedHabits: string[];
}