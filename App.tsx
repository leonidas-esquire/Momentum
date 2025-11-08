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
import { generateSquadHuddlePrompt } from './services/geminiService';

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
  momentumCharges: 0,
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

    // Effect for AI Squad Huddle
    useEffect(() => {
      const triggerSquadHuddle = async (squad: Squad, squadRipples: Ripple[], squadMessages: ChatMessage[]) => {
          if (!user) return;
          const lastAIMessage = squadMessages
              .filter(m => m.userId === 'ai-co-captain')
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          const twentyFourHours = 24 * 60 * 60 * 1000;
          const needsHuddle = !lastAIMessage || (new Date().getTime() - new Date(lastAIMessage.timestamp).getTime() > twentyFourHours);
          
          if (needsHuddle) {
              const recentRipples = squadRipples.filter(r => new Date().getTime() - new Date(r.timestamp).getTime() < twentyFourHours);
              const prompt = await generateSquadHuddlePrompt(squad.name, squad.goalIdentity, recentRipples, user.language);
              
              const newHuddleMessage: ChatMessage = {
                  id: `chat-${Date.now()}`,
                  squadId: squad.id,
                  userId: 'ai-co-captain',
                  userName: 'AI Co-Captain',
                  text: prompt,
                  timestamp: new Date().toISOString(),
                  isHuddleMessage: true,
              };
              setChatMessages(prev => [...prev, newHuddleMessage]);
          }
      };

      if (user?.squadId) {
          const currentSquad = squads.find(s => s.id === user.squadId);
          if (currentSquad) {
              const squadMessages = chatMessages.filter(m => m.squadId === user.squadId);
              const squadRipples = ripples.filter(r => r.squadId === user.squadId);
              triggerSquadHuddle(currentSquad, squadRipples, squadMessages);
          }
      }
    }, [user, squads, ripples, chatMessages]);

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
        setUser({...newUser, momentumCharges: 0});
        setHabits(habitsWithIds);
        localStorage.setItem('momentum_user', JSON.stringify({...newUser, momentumCharges: 0}));
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
        if (!user) return;
        let chargeGenerated = false;

        const newHabits = habits.map(h => {
            if (h.id === habitId && !isToday(h.lastCompleted)) {
                if (h.id === priorityHabitId || h.streak > 7) {
                    chargeGenerated = true;
                }
                const newStreak = h.streak + 1;
                return { ...h, streak: newStreak, longestStreak: Math.max(h.longestStreak, newStreak), lastCompleted: new Date().toISOString(), completions: [...h.completions, new Date().toISOString()], };
            }
            return h;
        });

        if (chargeGenerated) {
            const updatedUser = { ...user, momentumCharges: (user.momentumCharges || 0) + 1 };
            setUser(updatedUser);
            localStorage.setItem('momentum_user', JSON.stringify(updatedUser));
            addToast("You've generated a Momentum Charge! ✨", 'success');
        } else {
            addToast('Great job! Momentum built.', 'info');
        }

        setHabits(newHabits);
        localStorage.setItem('momentum_habits', JSON.stringify(newHabits));
        
        // Check for and resolve any open assist requests
        const openAssistRequest = ripples.find(r => r.type === 'assist_request' && r.authorId === user.id && !r.isResolved);
        if (openAssistRequest) {
            setRipples(ripples.map(r => r.id === openAssistRequest.id ? { ...r, isResolved: true } : r));
            const successRipple: Ripple = {
                id: `ripple-${Date.now()}`,
                squadId: user.squadId!,
                authorId: user.id,
                authorName: user.name,
                type: 'win_shared',
                message: `crushed their goal with the squad's help!`,
                timestamp: new Date().toISOString(),
                nudges: [],
            };
            setRipples(prev => [successRipple, ...prev]);
        }
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
    
    const handleProposeSquadNameChange = (squadId: string, proposedName: string) => {
        if (!user) return;
        setSquads(squads.map(s => {
            if (s.id === squadId) {
                return {
                    ...s,
                    nameChangeVote: {
                        proposedName,
                        proposerId: user.id,
                        proposerName: user.name,
                        votes: { [user.id]: true }
                    }
                };
            }
            return s;
        }));
        addToast('Squad name change proposed!', 'info');
    };

    const handleVoteForSquadNameChange = (squadId: string) => {
        if (!user) return;
        let squadToUpdate = squads.find(s => s.id === squadId);
        if (!squadToUpdate || !squadToUpdate.nameChangeVote) return;

        const updatedVote = {
            ...squadToUpdate.nameChangeVote,
            votes: {
                ...squadToUpdate.nameChangeVote.votes,
                [user.id]: true
            }
        };

        const votesCount = Object.keys(updatedVote.votes).length;
        const requiredVotes = Math.floor(squadToUpdate.members.length / 2) + 1;

        if (votesCount >= requiredVotes) {
            const originalName = squadToUpdate.name;
            const newName = updatedVote.proposedName;
            squadToUpdate = { ...squadToUpdate, name: newName, nameChangeVote: undefined };
            addToast(`Squad name changed to "${newName}"!`, 'success');

            // Add a system message to the chat
            const systemMessage: ChatMessage = {
                id: `chat-${Date.now()}`,
                squadId,
                userId: 'system',
                userName: 'System',
                text: `${user.name} cast the final vote. The squad name is now "${newName}".`,
                timestamp: new Date().toISOString(),
            };
            setChatMessages(prev => [...prev, systemMessage]);

        } else {
            squadToUpdate = { ...squadToUpdate, nameChangeVote: updatedVote };
        }
        
        setSquads(squads.map(s => s.id === squadId ? squadToUpdate! : s));
    };

    const handleContributeMomentumToSaga = (squadId: string) => {
        if (!user || (user.momentumCharges || 0) <= 0) return;
        
        const SAGA_DAMAGE_PER_CHARGE = 10;
        
        const updatedUser = { ...user, momentumCharges: user.momentumCharges - 1 };
        setUser(updatedUser);
        localStorage.setItem('momentum_user', JSON.stringify(updatedUser));

        setSquads(squads.map(s => {
            if (s.id === squadId && s.saga) {
                const newHp = Math.max(0, s.saga.boss.hp - SAGA_DAMAGE_PER_CHARGE);
                return { ...s, saga: { ...s.saga, boss: { ...s.saga.boss, hp: newHp } } };
            }
            return s;
        }));

        const squad = squads.find(s => s.id === squadId);
        if (squad) {
            const newRipple: Ripple = {
                id: `ripple-${Date.now()}`,
                squadId,
                authorId: user.id,
                authorName: user.name,
                type: 'saga_contribution',
                message: `contributed momentum to the Saga, dealing ${SAGA_DAMAGE_PER_CHARGE} damage to ${squad.saga?.boss.name}!`,
                timestamp: new Date().toISOString(),
                nudges: [],
            };
            setRipples(prev => [newRipple, ...prev]);
            addToast('Your momentum weakened the boss!', 'success');
        }
    };
    
    const handleRequestAssist = () => {
        if (!user || !user.squadId) return;

        // Prevent spamming requests
        const existingRequest = ripples.find(r => r.type === 'assist_request' && r.authorId === user.id && !r.isResolved);
        if (existingRequest) {
            addToast("You already have an active assist request.", 'warning');
            return;
        }

        const newRipple: Ripple = {
            id: `ripple-${Date.now()}`,
            squadId: user.squadId,
            authorId: user.id,
            authorName: user.name,
            type: 'assist_request',
            message: 'is running low on momentum and could use a boost!',
            timestamp: new Date().toISOString(),
            nudges: [],
            isResolved: false,
        };
        setRipples(prev => [newRipple, ...prev]);
        addToast("Squad Assist requested. Help is on the way!", 'info');
    };

    const handleOfferAssist = (rippleId: string, message: string) => {
        if (!user) return;
        setRipples(ripples.map(r => {
            if (r.id === rippleId) {
                const newNudge = { nudgerName: user.name, message };
                return { ...r, nudges: [...r.nudges, newNudge] };
            }
            return r;
        }));
        addToast("Encouragement sent!", 'success');
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
                  onProposeSquadNameChange={handleProposeSquadNameChange}
                  onVoteForSquadNameChange={handleVoteForSquadNameChange}
                  onContributeMomentumToSaga={handleContributeMomentumToSaga}
                  onRequestToJoinSquad={() => {}}
                  onVoteOnJoinRequest={() => {}}
                  onVoteToKick={() => {}}
                  onEnergySelect={() => {}}
                  onNudge={handleOfferAssist}
                  onCompleteSquadQuest={() => {}}
                  onSendChatMessage={() => {}}
                  onAcceptMicroHabit={() => {}}
                  onDismissMentor={() => {}}
                  onCloseChapterUnlockModal={() => setChapterUnlockData(null)}
                  onAcceptMasteryMission={() => {}}
                  onAdoptEvolvedHabit={() => {}}
                  onRequestAssist={handleRequestAssist}
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