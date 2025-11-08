import React, { useState, useEffect, useContext } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { User, Habit, DailyDebrief, Squad, Team, Financials, SquadQuest, SquadSaga, ChatMessage, TeamChallenge, AssistRequest, UserIdentity } from './types';
import { UpgradeModal } from './components/UpgradeModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ChapterUnlockModal } from './components/ChapterUnlockModal';
import { Chatbot } from './components/Chatbot';
import { RallyPointModal } from './components/RallyPointModal';
import { isToday, isYesterday } from './utils/date';
import { ThemeContext } from './contexts/ThemeContext';


// MOCK DATA - In a real application, this would come from a backend API
export const MOCK_SQUADS: Squad[] = [
  { id: 'squad1', name: 'The Creators', goalIdentity: 'Creator', members: [{ userId: 'user1', name: 'Alex', totalCompletions: 102 }], sharedMomentum: 1250 },
];
export const MOCK_TEAMS: Team[] = [
  { id: 'team1', name: 'Momentum HQ', members: [], subscriptionStatus: 'active' },
];
export const MOCK_FINANCIALS: Financials = { revenuePerProUser: 10, revenuePerTeamMember: 8, monthlyCosts: 5000 };
export const MOCK_QUESTS: SquadQuest[] = [
    {id: 'q1', title: 'Complete 10 habits as a squad', points: 100, isCompleted: false, completedBy: undefined},
    {id: 'q2', title: 'Achieve a 5-day collective streak', points: 250, isCompleted: false, completedBy: undefined},
];
export const MOCK_SAGA: SquadSaga = { title: 'The Shadow of Procrastination', chapter: 1, lore: 'A creeping dread threatens the productivity of the land. Only by combining your momentum can you push it back.', milestones: [{description: 'Defeat 5 Demotivators', isCompleted: false}], boss: { name: 'The Snooze Fiend', hp: 1000, maxHp: 1000 }};
export let MOCK_CHAT: ChatMessage[] = [];
export const MOCK_CHALLENGES: TeamChallenge[] = [];
export const MOCK_ASSIST_REQUESTS: AssistRequest[] = [
    {id: 'ar1', requesterId: 'user2', requesterName: 'Jordan', requesterIdentity: 'The Learner', habitTitle: 'Read for 30 minutes', timestamp: Date.now()}
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChapterUnlock, setShowChapterUnlock] = useState<{identity: UserIdentity, chapter: any} | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [rallyPointHabit, setRallyPointHabit] = useState<Habit | null>(null);
  const { setTheme } = useContext(ThemeContext)!;
  
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('momentum_user');
      const storedHabits = localStorage.getItem('momentum_habits');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedHabits) {
        const loadedHabits: Habit[] = JSON.parse(storedHabits);
        
        // Rally Point check
        const habitForRally = loadedHabits.find(h => 
            h.streak >= 7 && 
            h.lastCompleted &&
            !isToday(h.lastCompleted) && 
            !isYesterday(h.lastCompleted)
        );

        if (habitForRally) {
            setRallyPointHabit(habitForRally);
        }

        setHabits(loadedHabits);
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  // Sync theme when user object changes
  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('momentum_user', JSON.stringify(user));
    }
  }, [user]);
  
  useEffect(() => {
    if (habits.length > 0 || user) { // Also save empty habits array if user exists
      localStorage.setItem('momentum_habits', JSON.stringify(habits));
    }
  }, [habits, user]);
  
  const handleOnboardingComplete = (newUser: User, newHabits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>[]) => {
    setUser(newUser);
    const habitsWithIds: Habit[] = newHabits.map((h, i) => ({
        ...h,
        id: `habit-${Date.now()}-${i}`,
        streak: 0,
        longestStreak: 0,
        lastCompleted: null,
        completions: [],
        momentumShields: 1,
        missedDays: 0,
    }));
    setHabits(habitsWithIds);
  };
  
  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>) => {
    const habit: Habit = {
        ...newHabit,
        id: `habit-${Date.now()}`,
        streak: 0,
        longestStreak: 0,
        lastCompleted: null,
        completions: [],
        momentumShields: 1,
        missedDays: 0,
    };
    setHabits(prev => [...prev, habit]);
  };
  
  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };
  
  const handleSignOut = () => {
      localStorage.removeItem('momentum_user');
      localStorage.removeItem('momentum_habits');
      setUser(null);
      setHabits([]);
  };

  const handleRallyPointComplete = (rallyBeaconLit: boolean, habit: Habit) => {
    if (rallyBeaconLit && user) {
        const beaconMessage: ChatMessage = {
            id: `rally-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            text: `${user.name} is lighting a Rally Beacon and is focused on getting back on track! Let's send them some energy! 🔥`,
            timestamp: Date.now(),
            isRallyBeacon: true,
        };
        MOCK_CHAT.push(beaconMessage); // In a real app, this would be an API call
    }
    
    // Reset the habit's streak
    setHabits(prev => prev.map(h => 
        h.id === habit.id ? { ...h, streak: 0, missedDays: 0 } : h
    ));

    setRallyPointHabit(null); // Close the modal
  };

  if (!user || !user.onboardingCompleted) {
    return (
      <>
        <Onboarding
          onComplete={handleOnboardingComplete}
          onTriggerUpgrade={(reason) => setShowUpgradeModal(reason)}
          onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        />
        {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
      </>
    );
  }
  
  return (
    <>
      <Dashboard
        user={user}
        habits={habits}
        onUpdateUser={setUser}
        onAddHabit={handleAddHabit}
        onUpdateHabit={(h) => setHabits(prev => prev.map(p => p.id === h.id ? h : p))}
        onDeleteHabit={handleDeleteHabit}
        onSignOut={handleSignOut}
        onTriggerUpgrade={(reason) => setShowUpgradeModal(reason)}
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
      />
      {showUpgradeModal && <UpgradeModal reason={showUpgradeModal} onClose={() => setShowUpgradeModal(null)} onUpgrade={() => {}} />}
      {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
      {showChapterUnlock && <ChapterUnlockModal identity={showChapterUnlock.identity} newChapter={showChapterUnlock.chapter} onClose={() => setShowChapterUnlock(null)} />}
      {showChatbot && <Chatbot user={user} habits={habits} onClose={() => setShowChatbot(false)} />}
      {rallyPointHabit && <RallyPointModal habit={rallyPointHabit} onComplete={(beaconLit) => handleRallyPointComplete(beaconLit, rallyPointHabit)} />}
    </>
  );
};

export default App;