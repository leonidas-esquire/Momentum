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

export interface Reminder {
  type: 'time' | 'location';
  time?: string;
  location?: 'home' | 'work';
  locationLabel?: string;
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
  isFavorite: boolean;
  momentumShields: number;
  missedDays: number;
  reminder?: Reminder;
}

export interface BlueprintHabit {
  title: string;
  description: string;
  cue: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'founder' | 'user';
  selectedIdentities: UserIdentity[];
  squadId?: string;
  teamId?: string;
  subscription: {
    plan: 'free' | 'pro' | 'team';
    status: 'active' | 'inactive';
  };
  language: string;
  theme: 'light' | 'dark';
  voicePreference: string;
  momentumCharges?: number;
}

export interface RallyPointData {
  question: string;
  options: {
    text: string;
    protocol: string;
  }[];
}

export interface DailyHuddleData {
  mostImportantHabitId: string;
  greeting: string;
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
  completedBy?: string;
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
  isRallyBeacon?: boolean;
}

export interface Mission {
  title: string;
  description: string;
  targetHabitId: string;
  targetCompletions: number;
  currentCompletions: number;
}

export interface TeamMember {
  userId: string;
  name: string;
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
  title: string;
  description: string;
  targetCompletions: number;
  currentCompletions: number;
  isActive: boolean;
}

export type Mood = 'terrible' | 'bad' | 'okay' | 'good' | 'great';

export interface DailyDebrief {
  date: string;
  mood: Mood;
  guidedAnswers: Record<string, string>;
  privateNote: string;
  isShared: boolean;
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