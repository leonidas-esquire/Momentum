import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { UpgradeModal } from './components/UpgradeModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { DailyDebriefModal } from './components/DailyDebriefModal';
import { Toast, ToastMessage } from './components/Toast';
import { User, Habit, Squad, Ripple, Mission, ChatMessage, Team, TeamChallenge, Financials, MentorIntervention, DailyDebrief, ChapterUnlockData } from './types';
import { getTodayDateString, isToday } from './utils/date';

// MOCK DATA - In a real app, this would come from a server.
const mockInitialUser: User = {
  id: 'user-1',
  name: 'Alex',
  email: 'alex@momentum.app',
  selectedIdentities: [],
  identityStatements: {},
  onboardingCompleted: false,
  lastHuddleDate: null,
  language: 'en',
  subscription: { plan: 'free' },
  dailyTranslations: { date: '', count: 0 },
  consent: { privacyPolicy: '', termsOfService: '' },
  dailyDebriefs: [],
};

const mockSquads: Squad[] = [];
const mockRipples: Ripple[] = [];
const mockMission: Mission | null = null;
const mockChatMessages: ChatMessage[] = [];
const mockTeams: Team[] = [];
const mockTeamChallenges: TeamChallenge[] = [];
const mockFinancials: Financials = { revenuePerProUser: 10, revenuePerTeamMember: 8, monthlyCosts: 5000 };
const mockAllUsers: User[] = [mockInitialUser];
// END MOCK DATA

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [mission, setMission] = useState<Mission | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
    const [financials, setFinancials] = useState<Financials | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    
    const [priorityHabitId, setPriorityHabitId] = useState<string | null>(null);
    const [dailyHuddleData, setDailyHuddleData] = useState(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
    const [showDailyDebrief, setShowDailyDebrief] = useState(false);

    const [mentorIntervention, setMentorIntervention] = useState<MentorIntervention | null>(null);
    const [chapterUnlockData, setChapterUnlockData] = useState<ChapterUnlockData | null>(null);

    useEffect(() => {
        const loadedUser = localStorage.getItem('momentum_user');
        if (loadedUser) {
            setUser(JSON.parse(loadedUser));
            setHabits(JSON.parse(localStorage.getItem('momentum_habits') || '[]'));
            setPriorityHabitId(localStorage.getItem('momentum_priorityHabit'));
        } else {
             setUser(mockInitialUser);
        }
        setSquads(mockSquads);
        setRipples(mockRipples);
        setMission(mockMission);
        setChatMessages(mockChatMessages);
        setTeams(mockTeams);
        setTeamChallenges(mockTeamChallenges);
        setFinancials(mockFinancials);
        setAllUsers(mockAllUsers);
    }, []);

    const addToast = (message: string, type: ToastMessage['type']) => {
        const id = new Date().toISOString() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const handleOnboardingComplete = (newUser: User, newHabits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>[]) => {
        const habitsWithIds: Habit[] = newHabits.map((h, i) => ({
            ...h,
            id: `habit-${Date.now()}-${i}`,
            streak: 0,
            longestStreak: 0,
            lastCompleted: null,
            completions: [],
            momentumShields: 0,
        }));
        setUser(newUser);
        setHabits(habitsWithIds);
        localStorage.setItem('momentum_user', JSON.stringify(newUser));
        localStorage.setItem('momentum_habits', JSON.stringify(habitsWithIds));
        addToast('Welcome to Momentum! Your journey begins now.', 'success');
    };

    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('momentum_user', JSON.stringify(updatedUser));
    };

    const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>) => {
        if (habits.length >= 5 && user?.subscription.plan === 'free') {
            handleTriggerUpgrade('habit');
            return;
        }
        const habitToAdd: Habit = { ...newHabit, id: `habit-${Date.now()}`, streak: 0, longestStreak: 0, lastCompleted: null, completions: [], momentumShields: 0, };
        const updatedHabits = [...habits, habitToAdd];
        setHabits(updatedHabits);
        localStorage.setItem('momentum_habits', JSON.stringify(updatedHabits));
        addToast(`Habit "${habitToAdd.title}" added!`, 'success');
    };

    const handleCompleteHabit = (habitId: string) => {
      const newHabits = habits.map(h => {
          if (h.id === habitId && !isToday(h.lastCompleted)) {
              const newStreak = h.streak + 1;
              return { ...h, streak: newStreak, longestStreak: Math.max(h.longestStreak, newStreak), lastCompleted: new Date().toISOString(), completions: [...h.completions, new Date().toISOString()], };
          }
          return h;
      });
      setHabits(newHabits);
      localStorage.setItem('momentum_habits', JSON.stringify(newHabits));
      addToast('Great job! Momentum built.', 'info');
    };

    const handleDeleteHabit = (habitId: string) => {
      const updatedHabits = habits.filter(h => h.id !== habitId);
      setHabits(updatedHabits);
      localStorage.setItem('momentum_habits', JSON.stringify(updatedHabits));
      if (priorityHabitId === habitId) {
          setPriorityHabitId(null);
          localStorage.removeItem('momentum_priorityHabit');
      }
      addToast('Habit removed.', 'danger');
    };

    const handleSetPriorityHabit = (habitId: string) => {
        const newPriorityId = priorityHabitId === habitId ? null : habitId;
        setPriorityHabitId(newPriorityId);
        if (newPriorityId) {
            localStorage.setItem('momentum_priorityHabit', newPriorityId);
            addToast('Focus set for today!', 'info');
        } else {
            localStorage.removeItem('momentum_priorityHabit');
        }
    };

    const handleTriggerUpgrade = (reason: string) => {
        setUpgradeReason(reason);
        setShowUpgradeModal(true);
    };

    const handleCreateSquad = (name: string, goalIdentity: string) => {
      if(!user) return;
      const newSquad: Squad = { id: `squad-${Date.now()}`, name, goalIdentity, members: [{ userId: user.id, name: user.name }], sharedMomentum: 0, quests: [], joinRequests: [], kickVotes: {}, };
      setSquads(prev => [...prev, newSquad]);
      const updatedUser = { ...user, squadId: newSquad.id };
      setUser(updatedUser);
      localStorage.setItem('momentum_user', JSON.stringify(updatedUser));
      addToast(`Squad "${name}" created!`, 'success');
    };

    const handleSaveDebrief = (debrief: DailyDebrief, sharedWin: string | null) => {
      if (!user) return;
      const updatedUser = { ...user, dailyDebriefs: [...user.dailyDebriefs, debrief] };
      setUser(updatedUser);
      localStorage.setItem('momentum_user', JSON.stringify(updatedUser));
      
      if (sharedWin && user.squadId) {
          const newRipple: Ripple = { id: `ripple-${Date.now()}`, squadId: user.squadId, authorId: user.id, authorName: user.name, type: 'win_shared', message: sharedWin, timestamp: new Date().toISOString(), nudges: [], };
          setRipples(prev => [newRipple, ...prev]);
      }
      addToast('Debrief saved. Reflection is growth!', 'success');
      setShowDailyDebrief(false);
    };

    const handleCreateTeamChallenge = (challenge: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => {
        const newChallenge: TeamChallenge = { ...challenge, id: `challenge-${Date.now()}`, currentCompletions: 0, isActive: true, };
        const updatedChallenges = teamChallenges.map(c => ({...c, isActive: false}));
        setTeamChallenges([...updatedChallenges, newChallenge]);
        addToast(`New team challenge "${challenge.title}" created!`, 'success');
    };

    if (!user) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    return (
        <>
            {!user.onboardingCompleted ? (
              <Onboarding onComplete={handleOnboardingComplete} onTriggerUpgrade={handleTriggerUpgrade} onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)} />
            ) : (
              <Dashboard
                  user={user}
                  habits={habits}
                  squads={squads}
                  ripples={ripples}
                  chatMessages={chatMessages}
                  mission={mission}
                  priorityHabitId={priorityHabitId}
                  dailyHuddleData={dailyHuddleData as any}
                  showDailyHuddle={false}
                  teams={teams}
                  teamChallenges={teamChallenges}
                  financials={financials!}
                  allUsers={allUsers}
                  mentorIntervention={mentorIntervention}
                  chapterUnlockData={chapterUnlockData}
                  onAddHabit={handleAddHabit}
                  onCompleteHabit={handleCompleteHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onUpdateUser={handleUpdateUser}
                  onSetPriorityHabit={handleSetPriorityHabit}
                  onCreateSquad={handleCreateSquad}
                  onTriggerUpgrade={handleTriggerUpgrade}
                  onOpenSettings={() => setShowSettingsModal(true)}
                  onOpenDailyDebrief={() => setShowDailyDebrief(true)}
                  onCreateTeamChallenge={handleCreateTeamChallenge}
                  onRequestToJoinSquad={() => {}}
                  onVoteOnJoinRequest={() => {}}
                  onVoteToKick={() => {}}
                  onEnergySelect={() => {}}
                  onNudge={() => {}}
                  onCompleteSquadQuest={() => {}}
                  onSendChatMessage={() => {}}
                  onAcceptMicroHabit={() => {}}
                  onDismissMentor={() => {}}
                  onCloseChapterUnlockModal={() => setChapterUnlockData(null)}
                  onAcceptMasteryMission={() => {}}
                  onAdoptEvolvedHabit={() => {}}
              />
            )}

            {showUpgradeModal && <UpgradeModal reason={upgradeReason} onClose={() => setShowUpgradeModal(false)} onUpgrade={() => { /* Handle upgrade */ }} />}
            {showSettingsModal && user && <SettingsModal user={user} onClose={() => setShowSettingsModal(false)} onUpdateUser={handleUpdateUser} onDeleteAccount={() => { /* Handle delete */ }} onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)} />}
            {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
            {showDailyDebrief && user && <DailyDebriefModal user={user} habits={habits} onClose={() => setShowDailyDebrief(false)} onSave={handleSaveDebrief} />}

            <div className="fixed top-4 right-4 z-[100] w-full max-w-sm">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(t => t.filter(x => x.id !== toast.id))} />
                ))}
            </div>
        </>
    );
};

export default App;
