import React, { useState, useEffect, useContext, useRef } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { User, Habit, UserIdentity, Squad, Ripple, Mission, DailyHuddleData, JoinRequest, Nudge, SquadQuest, ChatMessage, Team, TeamChallenge } from './types';
import { Toast, ToastMessage } from './components/Toast';
import { generateMomentumMission, generateDailyHuddle, generateLowEnergySuggestion, generateSquadQuests, translateText } from './services/geminiService';
// Fix: Imported the Icon component to resolve a 'Cannot find name' error.
import { Icon } from './components/Icon';
import { LanguageContext } from './contexts/LanguageContext';
import { Chatbot } from './components/Chatbot';
import { UpgradeModal } from './components/UpgradeModal';

const initialSquads: Squad[] = [
  { id: 'squad-1', name: 'Momentum Mavericks', goalIdentity: 'Achiever', members: ['Leo', 'Mia', 'Zoe'], sharedMomentum: 15432, pendingRequests: [], activeKickVotes: [] },
  { id: 'squad-2', name: 'The Consistency Crew', goalIdentity: 'Creator', members: ['Alex', 'Ben'], sharedMomentum: 12109, pendingRequests: [], activeKickVotes: [] },
  { id: 'squad-3', name: 'Habit Hackers', goalIdentity: 'Learner', members: ['Chloe', 'David', 'Eva', 'Frank'], sharedMomentum: 9876, pendingRequests: [], activeKickVotes: [] },
  { id: 'squad-4', name: 'Dopamine Dynamos', goalIdentity: 'Athlete', members: ['Grace', 'Henry'], sharedMomentum: 7531, pendingRequests: [], activeKickVotes: [] },
  { id: 'squad-5', name: 'The Cultivators', goalIdentity: 'Connector', members: ['Ivy', 'Jack', 'Kara'], sharedMomentum: 23145, pendingRequests: [], activeKickVotes: [] },
  { id: 'squad-6', name: 'Achiever\'s Alliance', goalIdentity: 'Achiever', members: ['Nora', 'Oscar'], sharedMomentum: 18345, pendingRequests: [], activeKickVotes: [] },
];

const mockTeam: Team = {
    id: 'team-acme-corp',
    name: 'ACME Corporation',
    adminUserId: 'user-123', // The main user will be the admin for this demo
    members: [
        { userId: 'user-123', name: 'John Doe', email: 'john.doe@example.com', totalCompletions: 128 },
        { userId: 'user-456', name: 'Jane Smith', email: 'jane.smith@example.com', totalCompletions: 152 },
        { userId: 'user-789', name: 'Peter Jones', email: 'peter.jones@example.com', totalCompletions: 98 },
    ],
    subscriptionStatus: 'active',
};

const mockTeamChallenges: TeamChallenge[] = [
    { id: 'challenge-1', teamId: 'team-acme-corp', title: 'Q3 Wellness Push', description: 'Log 500 minutes of mindfulness or exercise.', habitCategory: 'Wellness', targetCompletions: 500, currentCompletions: 275, isActive: true },
];

const SQUAD_MEMBER_LIMIT = 5;
const JOIN_APPROVAL_THRESHOLD = 2;
const KICK_VOTE_THRESHOLD_RATIO = 0.5; // More than 50%
const FREE_HABIT_LIMIT = 3;
const FREE_TRANSLATION_LIMIT = 10;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [squads, setSquads] = useState<Squad[]>(initialSquads);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [priorityHabitId, setPriorityHabitId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<{ identity: UserIdentity; habit: Habit } | null>(null);
  
  const [dailyHuddleData, setDailyHuddleData] = useState<DailyHuddleData | null>(null);
  const [showDailyHuddle, setShowDailyHuddle] = useState(false);
  const [isGeneratingHuddle, setIsGeneratingHuddle] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('');
  
  // B2B State
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);

  const pendingTranslations = useRef(new Set<string>());

  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error('LanguageContext must be used within a LanguageProvider');
  }
  const { language, setLanguage } = languageContext;


  const addToast = (message: string, type: 'success' | 'info' | 'danger' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const triggerUpgradeModal = (reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handleSimulateUpgrade = () => {
    if (user) {
        setUser({
            ...user,
            subscription: { plan: 'pro' },
        });
        addToast("Welcome to Momentum Pro! All features unlocked.", 'success');
        setShowUpgradeModal(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('momentum_user');
      const storedHabits = localStorage.getItem('momentum_habits');
      const storedSquads = localStorage.getItem('momentum_squads');
      const storedRipples = localStorage.getItem('momentum_ripples');
      const storedChat = localStorage.getItem('momentum_chat');
      const storedMission = localStorage.getItem('momentum_mission');
      const storedPriorityId = localStorage.getItem('momentum_priority_habit_id');
      const storedTeams = localStorage.getItem('momentum_teams');
      const storedTeamChallenges = localStorage.getItem('momentum_team_challenges');
      
      if (storedUser) {
        let parsedUser: User = JSON.parse(storedUser);
        if (!parsedUser.id) parsedUser.id = 'user-123'; // Assign ID for demo purposes
        if (!parsedUser.language) parsedUser.language = 'en';
        if (!parsedUser.subscription) parsedUser.subscription = { plan: 'free' };
        if (!parsedUser.dailyTranslations) parsedUser.dailyTranslations = { date: '', count: 0 };

        // If user is on a team, they get pro features.
        const userTeam = storedTeams ? (JSON.parse(storedTeams) as Team[]).find(t => t.id === parsedUser.teamId) : null;
        if (userTeam && userTeam.subscriptionStatus === 'active') {
            parsedUser.subscription.plan = 'team';
        }

        setUser(parsedUser);
        if (parsedUser.language) {
            setLanguage(parsedUser.language);
        }
      }
      if (storedHabits) setHabits(JSON.parse(storedHabits));
      if (storedSquads) setSquads(JSON.parse(storedSquads));
      if (storedRipples) setRipples(JSON.parse(storedRipples));
      if (storedChat) setChatMessages(JSON.parse(storedChat));
      if (storedPriorityId) setPriorityHabitId(JSON.parse(storedPriorityId));
      if (storedMission) {
        const parsedMission = JSON.parse(storedMission);
        const missionDate = new Date(parsedMission.id);
        const today = new Date();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (today.getTime() - missionDate.getTime() < oneWeek) {
            setMission(parsedMission);
        } else {
             localStorage.removeItem('momentum_mission');
        }
    }
    setTeams(storedTeams ? JSON.parse(storedTeams) : []);
    setTeamChallenges(storedTeamChallenges ? JSON.parse(storedTeamChallenges) : []);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);
  
  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
  };

  // Daily Huddle Check
  useEffect(() => {
    if (isLoaded && user?.onboardingCompleted && habits.length > 0) {
      const todayStr = getTodayDateString();
      if (user.lastHuddleDate !== todayStr && !showDailyHuddle && !isGeneratingHuddle) {
        setIsGeneratingHuddle(true);
        generateDailyHuddle(user.name, habits, mission, language).then(huddleData => {
          setDailyHuddleData(huddleData);
          setShowDailyHuddle(true);
          handleUpdateUser({ ...user, lastHuddleDate: todayStr });
          setIsGeneratingHuddle(false);
        });
      }
    }
  }, [isLoaded, user, habits, mission, language]);

  // Daily Squad Quest Check
    useEffect(() => {
        if (isLoaded && user?.squadId) {
            const squad = squads.find(s => s.id === user.squadId);
            const todayStr = getTodayDateString();

            if (squad && squad.dailyQuests?.date !== todayStr) {
                generateSquadQuests(squad.goalIdentity, language).then(generatedQuests => {
                    const newQuests: SquadQuest[] = generatedQuests.map((q, i) => ({
                        id: `${todayStr}-${i}`,
                        title: q.title,
                        points: q.points,
                        isCompleted: false,
                        completedBy: null,
                    }));
                    
                    const updatedSquad = {
                        ...squad,
                        dailyQuests: {
                            date: todayStr,
                            quests: newQuests,
                        },
                    };

                    setSquads(squads.map(s => s.id === squad.id ? updatedSquad : s));
                });
            }
        }
    }, [isLoaded, user, squads, language]);


  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkMissedHabits = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let wasHabitUpdated = false;
      const updatedHabits = habits.map(habit => {
        let newHabit = { ...habit, microVersion: null }; // Reset micro-versions daily
        const lastCompletedDate = newHabit.lastCompleted ? new Date(newHabit.lastCompleted) : null;
        if (lastCompletedDate) lastCompletedDate.setHours(0, 0, 0, 0);

        // Check for FAILED comeback challenges
        if (newHabit.comebackChallenge?.isActive && (!lastCompletedDate || lastCompletedDate.getTime() < yesterday.getTime())) {
            addToast(`Comeback Challenge failed for "${newHabit.title}". A new journey begins!`, 'danger');
            wasHabitUpdated = true;
            const { comebackChallenge, ...restOfHabit } = newHabit;
            return { ...restOfHabit, streak: 0 };
        }

        // Check for NEWLY broken streaks
        if (newHabit.streak > 0 && (!lastCompletedDate || lastCompletedDate.getTime() < yesterday.getTime())) {
           if (newHabit.momentumShields > 0) {
             addToast(`Momentum Shield used for "${newHabit.title}"! Your streak is safe.`, 'info');
             wasHabitUpdated = true;
             return { ...newHabit, momentumShields: newHabit.momentumShields - 1, lastCompleted: yesterday.toISOString() };
           } else if (newHabit.streak > 2) { // Only offer comeback for streaks > 2 days
             addToast(`Comeback Challenge for "${newHabit.title}"! Complete it 3 days in a row to restore your streak.`, 'warning');
             wasHabitUpdated = true;
             return { 
                 ...newHabit, 
                 streak: 0, 
                 comebackChallenge: { 
                     isActive: true, 
                     daysRemaining: 3, 
                     originalStreak: newHabit.streak 
                 } 
             };
           } else {
             addToast(`Streak broken for "${newHabit.title}". Let's start a new one!`, 'danger');
             wasHabitUpdated = true;
             return { ...newHabit, streak: 0 };
           }
        }
        return newHabit;
      });

      if (wasHabitUpdated) setHabits(updatedHabits);
    };

    checkMissedHabits();
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded) {
      try {
        if (user) localStorage.setItem('momentum_user', JSON.stringify({ ...user, language }));
        localStorage.setItem('momentum_habits', JSON.stringify(habits));
        localStorage.setItem('momentum_squads', JSON.stringify(squads));
        localStorage.setItem('momentum_ripples', JSON.stringify(ripples));
        localStorage.setItem('momentum_chat', JSON.stringify(chatMessages));
        localStorage.setItem('momentum_teams', JSON.stringify(teams));
        localStorage.setItem('momentum_team_challenges', JSON.stringify(teamChallenges));
        if (mission) localStorage.setItem('momentum_mission', JSON.stringify(mission));
        else localStorage.removeItem('momentum_mission');
        if (priorityHabitId) localStorage.setItem('momentum_priority_habit_id', JSON.stringify(priorityHabitId));
        else localStorage.removeItem('momentum_priority_habit_id');
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [user, habits, squads, ripples, chatMessages, mission, priorityHabitId, teams, teamChallenges, isLoaded, language]);

  useEffect(() => {
    if (!isLoaded || !user || habits.length < 2 || mission) return;

    const generateNewMission = async () => {
        const habitsSortedByStreak = [...habits].sort((a, b) => a.streak - b.streak);
        const leastConsistentHabit = habitsSortedByStreak[0];
        const mostConsistentHabit = habitsSortedByStreak[habitsSortedByStreak.length - 1];

        if (leastConsistentHabit) {
            const missionData = await generateMomentumMission(leastConsistentHabit, mostConsistentHabit, language);
            const newMission: Mission = {
                id: new Date().toISOString(),
                title: missionData.title,
                description: missionData.description,
                habitId: leastConsistentHabit.id,
                targetCompletions: missionData.targetCompletions,
                currentCompletions: 0,
                isCompleted: false,
                reward: { type: 'momentumShield', amount: 1 },
            };
            setMission(newMission);
            addToast("You have a new Momentum Mission for the week!", 'info');
        }
    };

    generateNewMission();
  }, [isLoaded, user, habits.length, mission, language]);

  // Automatic Chat Translation Effect
  useEffect(() => {
    const isPro = user?.subscription.plan === 'pro' || user?.subscription.plan === 'team';
    if (!user?.language || isPro) return;

    const targetLang = user.language;
    const todayStr = getTodayDateString();

    let translationsToday = user.dailyTranslations.date === todayStr ? user.dailyTranslations.count : 0;
    
    const messagesToTranslate = chatMessages.filter(msg => {
        const needsTranslation = msg.originalLanguage !== targetLang && !msg.translations[targetLang];
        const translationKey = `${msg.id}-${targetLang}`;
        return needsTranslation && !pendingTranslations.current.has(translationKey);
    });

    if (messagesToTranslate.length === 0) return;

    const updatedTranslations: Record<string, Record<string, string>> = {};
    let translationsMade = 0;

    const translationPromises = messagesToTranslate.map(async (msg) => {
        const translationKey = `${msg.id}-${targetLang}`;
        pendingTranslations.current.add(translationKey);

        if (translationsToday + translationsMade < FREE_TRANSLATION_LIMIT) {
            translationsMade++;
            const translatedText = await translateText(msg.originalText, targetLang, msg.originalLanguage);
            updatedTranslations[msg.id] = { [targetLang]: translatedText };
        } else {
            updatedTranslations[msg.id] = { [targetLang]: 'LIMIT_REACHED' };
        }
    });

    Promise.all(translationPromises).then(() => {
        setChatMessages(prevMessages => 
            prevMessages.map(msg => {
                if (updatedTranslations[msg.id]) {
                    return { ...msg, translations: { ...msg.translations, ...updatedTranslations[msg.id] } };
                }
                return msg;
            })
        );
        
        if (translationsMade > 0) {
            const newCount = translationsToday + translationsMade;
            setUser(u => u ? { ...u, dailyTranslations: { date: todayStr, count: newCount } } : u);
        }

        messagesToTranslate.forEach(msg => {
            const translationKey = `${msg.id}-${targetLang}`;
            pendingTranslations.current.delete(translationKey);
        });
    });

  }, [chatMessages, user?.language, user?.subscription.plan]);

  const handleOnboardingComplete = (
    newUser: User,
    blueprintHabits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>[]
  ) => {
    const finalUser: User = { 
        ...newUser, 
        id: 'user-123', // Static ID for demo
        language, 
        lastHuddleDate: null, 
        openToSquadSuggestions: true, 
        voicePreference: 'Kore',
        subscription: { plan: 'free' },
        dailyTranslations: { date: getTodayDateString(), count: 0 },
        // For demo: automatically add new user to the mock team
        teamId: mockTeam.id,
        isAdmin: true, // Make them the admin
    };

    // Add user to team and update subscription
    const updatedTeam = { ...mockTeam, members: [...mockTeam.members, { userId: finalUser.id, name: finalUser.name, email: finalUser.email, totalCompletions: 0 }] };
    finalUser.subscription.plan = 'team';

    setTeams([updatedTeam]);
    setTeamChallenges(mockTeamChallenges);
    setUser(finalUser);
  
    const habitsToAdd: Habit[] = blueprintHabits.map(h => ({
      ...h,
      id: new Date().toISOString() + Math.random(),
      streak: 0,
      longestStreak: 0,
      lastCompleted: null,
      completions: [],
      momentumShields: 0,
    }));
    
    setHabits(habitsToAdd);

    if (habitsToAdd.length > 0) {
        addToast(`Your Momentum Blueprint is set! Let's begin.`, 'success');
    }
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>) => {
    const isPro = user?.subscription.plan === 'pro' || user?.subscription.plan === 'team';
    if (!isPro && habits.length >= FREE_HABIT_LIMIT) {
        triggerUpgradeModal('habit');
        return;
    }

    const habitToAdd: Habit = {
      ...newHabit,
      id: new Date().toISOString() + Math.random(),
      streak: 0,
      longestStreak: 0,
      lastCompleted: null,
      completions: [],
      momentumShields: 0,
    };
    setHabits(prev => [...prev, habitToAdd]);
  };
  
  const handleCompleteHabit = (habitId: string) => {
    let completedHabit: Habit | null = null;
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const today = new Date();
        const todayStr = today.toISOString();
        const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
        
        if (lastCompletedDate && isSameDay(today, lastCompletedDate)) return habit;

        if (habit.comebackChallenge?.isActive) {
            const newDaysRemaining = habit.comebackChallenge.daysRemaining - 1;
            if (newDaysRemaining <= 0) {
                addToast(`Streak Restored for "${habit.title}"! You're back on track.`, 'success');
                const { comebackChallenge, ...restOfHabit } = habit;
                completedHabit = {
                    ...restOfHabit,
                    streak: habit.comebackChallenge!.originalStreak + 1,
                    longestStreak: Math.max(habit.longestStreak, habit.comebackChallenge!.originalStreak + 1),
                    lastCompleted: todayStr,
                    completions: [...habit.completions, todayStr],
                    microVersion: null,
                }
                return completedHabit;
            } else {
                addToast(`Comeback progress for "${habit.title}": ${newDaysRemaining} day(s) to go!`, 'info');
                completedHabit = {
                    ...habit,
                    lastCompleted: todayStr,
                    completions: [...habit.completions, todayStr],
                    comebackChallenge: { ...habit.comebackChallenge, daysRemaining: newDaysRemaining },
                    microVersion: null,
                }
                return completedHabit;
            }
        }

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let newStreak = (lastCompletedDate && isSameDay(yesterday, lastCompletedDate)) ? habit.streak + 1 : 1;
        let newShields = habit.momentumShields || 0;

        if (newStreak > 0 && newStreak % 7 === 0 && newShields < 3) {
            newShields += 1;
            addToast(`You earned a Momentum Shield for "${habit.title}"!`, 'success');
        }
        
        const newLongestStreak = Math.max(habit.longestStreak, newStreak);
        
        completedHabit = {
          ...habit,
          streak: newStreak,
          longestStreak: newLongestStreak,
          lastCompleted: todayStr,
          completions: [...habit.completions, todayStr],
          momentumShields: newShields,
          microVersion: null, // Clear micro-version on completion
        };
        return completedHabit;
      }
      return habit;
    });

    setHabits(updatedHabits);

    if (completedHabit && user) {
        if (mission && !mission.isCompleted && mission.habitId === habitId) {
            const newCurrentCompletions = mission.currentCompletions + 1;
            let missionCompleted = false;
            if (newCurrentCompletions >= mission.targetCompletions) {
                missionCompleted = true;
                addToast(`Mission Complete: "${mission.title}"! Reward earned.`, 'success');
                setHabits(currentHabits => currentHabits.map(h => {
                    if (h.id === mission.habitId) {
                        return { ...h, momentumShields: Math.min(3, h.momentumShields + mission.reward.amount) };
                    }
                    return h;
                }));
            }
            setMission({ ...mission, currentCompletions: newCurrentCompletions, isCompleted: missionCompleted });
        }

      if (user.squadId) {
        const squad = squads.find(s => s.id === user.squadId);
        if (squad) {
          const newRipple: Ripple = {
            id: Date.now().toString(),
            squadId: squad.id,
            fromUserName: user.name.split(' ')[0],
            habitTitle: completedHabit.title,
            identityTag: completedHabit.identityTag,
            timestamp: new Date().toISOString(),
            nudges: [],
          };
          setRipples(prev => [newRipple, ...prev].slice(0, 20));
          const updatedSquad = { ...squad, sharedMomentum: squad.sharedMomentum + (1 + completedHabit.streak) };
          setSquads(squads.map(s => s.id === updatedSquad.id ? updatedSquad : s));
        }
      }

      const identityToUpdate = user.selectedIdentities.find(id => id.name === completedHabit!.identityTag);
      if (identityToUpdate) {
        const xpGained = 10 + completedHabit.streak;
        const newXp = identityToUpdate.xp + xpGained;
        const xpForNextLevel = identityToUpdate.level * 100;
        let didLevelUp = false;
        let updatedIdentity = { ...identityToUpdate, xp: newXp };

        if (newXp >= xpForNextLevel) {
          didLevelUp = true;
          updatedIdentity.level += 1;
          updatedIdentity.xp = newXp - xpForNextLevel;
          addToast(`${identityToUpdate.name} leveled up to Level ${updatedIdentity.level}!`, 'success');
        }

        setUser({ ...user, selectedIdentities: user.selectedIdentities.map(id => id.id === updatedIdentity.id ? updatedIdentity : id) });

        if (didLevelUp) {
          const habitToEvolve = habits.find(h => h.id === habitId) || completedHabit;
          setLevelUpInfo({ identity: updatedIdentity, habit: habitToEvolve });
        }
      }
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    if (habitId === priorityHabitId) setPriorityHabitId(null);
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const handleUpdateUser = (updatedUser: User) => setUser(updatedUser);

  const handleSetPriorityHabit = (habitId: string) => setPriorityHabitId(prevId => (prevId === habitId ? null : habitId));

  const handleEvolveHabit = (habitId: string, newTitle: string) => {
    setHabits(habits => habits.map(h => h.id === habitId ? { ...h, title: newTitle, description: `Evolved from "${h.title}"` } : h));
    setLevelUpInfo(null);
  };
  
  const handleCreateSquad = (name: string, goalIdentity: string) => {
    if (!user) return;
    const newSquad: Squad = {
      id: Date.now().toString(),
      name,
      goalIdentity,
      members: [user.name],
      sharedMomentum: 0,
      pendingRequests: [],
      activeKickVotes: [],
    };
    setSquads(prev => [...prev, newSquad]);
    setUser({ ...user, squadId: newSquad.id });
    addToast(`Squad "${name}" created!`, 'success');
  };

  const handleRequestToJoinSquad = (squadId: string, pitch: string) => {
    if (!user) return;
    setSquads(prevSquads => {
        return prevSquads.map(s => {
            if (s.id === squadId) {
                if (s.pendingRequests.some(r => r.userName === user.name) || s.members.includes(user.name)) {
                    addToast("You already have a pending request or are a member of this squad.", 'warning');
                    return s;
                }
                const newRequest: JoinRequest = {
                    userName: user.name,
                    pitch,
                    approvals: [],
                    denials: [],
                };
                addToast("Your request to join has been sent!", 'success');
                return { ...s, pendingRequests: [...s.pendingRequests, newRequest] };
            }
            return s;
        });
    });
  };

  const handleVoteOnJoinRequest = (squadId: string, requestUserName: string, vote: 'approve' | 'deny') => {
    if (!user) return;
  
    setSquads(prevSquads => {
      const squad = prevSquads.find(s => s.id === squadId);
      if (!squad) return prevSquads;
  
      const request = squad.pendingRequests.find(r => r.userName === requestUserName);
      if (!request) return prevSquads;
  
      // --- Denial Logic ---
      if (vote === 'deny') {
        if (requestUserName === user.name) {
          addToast(`Your request to join ${squad.name} was denied.`, 'danger');
        } else {
          addToast(`Request from ${requestUserName} has been denied.`, 'info');
        }
        return prevSquads.map(s => s.id === squadId ? { ...s, pendingRequests: s.pendingRequests.filter(r => r.userName !== requestUserName) } : s);
      }
  
      // --- Approval Logic ---
      if (request.approvals.includes(user.name)) return prevSquads; // Already voted
      const newApprovals = [...request.approvals, user.name];
  
      const threshold = Math.min(JOIN_APPROVAL_THRESHOLD, squad.members.length === 0 ? 1 : squad.members.length);
  
      if (newApprovals.length >= threshold) {
        if (squad.members.length >= SQUAD_MEMBER_LIMIT) {
            addToast(`Could not add ${requestUserName}. The squad "${squad.name}" is full.`, 'danger');
            // Remove the pending request as it can't be fulfilled.
            return prevSquads.map(s => s.id === squadId ? { ...s, pendingRequests: s.pendingRequests.filter(r => r.userName !== requestUserName) } : s);
        }

        if (requestUserName === user.name) { // The current user's request was approved
          setUser(u => u ? { ...u, squadId: squadId } : null);
          addToast(`Welcome to ${squad.name}!`, 'success');
        } else { // Another user's request was approved
          addToast(`${requestUserName} has been accepted into the squad!`, 'success');
        }
  
        return prevSquads.map(s => {
          if (s.id === squadId) {
            return {
              ...s,
              members: [...s.members, requestUserName],
              pendingRequests: s.pendingRequests.filter(r => r.userName !== requestUserName),
            };
          }
          return s;
        });
      } else {
        // More votes needed, just update the request
        return prevSquads.map(s => {
          if (s.id === squadId) {
            const updatedRequests = s.pendingRequests.map(r =>
              r.userName === requestUserName ? { ...r, approvals: newApprovals } : r
            );
            return { ...s, pendingRequests: updatedRequests };
          }
          return s;
        });
      }
    });
  };
  
  const handleVoteToKick = (squadId: string, targetUserName: string) => {
    if (!user || user.name === targetUserName) return;
  
    setSquads(prevSquads => {
      const updatedSquads = JSON.parse(JSON.stringify(prevSquads));
      const squad = updatedSquads.find((s: Squad) => s.id === squadId);
      if (!squad) return prevSquads;
  
      let kickVote = squad.activeKickVotes.find((kv: any) => kv.targetUserName === targetUserName);
  
      if (!kickVote) {
        kickVote = { targetUserName, voters: [] };
        squad.activeKickVotes.push(kickVote);
      }
  
      if (kickVote.voters.includes(user.name)) return prevSquads;
  
      kickVote.voters.push(user.name);
      addToast(`Your vote to remove ${targetUserName} has been cast.`, 'info');
  
      const requiredVotes = Math.ceil(squad.members.length * KICK_VOTE_THRESHOLD_RATIO);
      if (kickVote.voters.length >= requiredVotes) {
        addToast(`${targetUserName} has been removed from the squad by vote.`, 'warning');
        squad.members = squad.members.filter((m: string) => m !== targetUserName);
        squad.activeKickVotes = squad.activeKickVotes.filter((kv: any) => kv.targetUserName !== targetUserName);
      }
  
      return updatedSquads;
    });
  };

  const handleEnergySelect = async (energy: 'low' | 'medium' | 'high') => {
    if (energy === 'low' && dailyHuddleData) {
      const habitToAdapt = habits.find(h => h.id === dailyHuddleData.mostImportantHabitId);
      if (habitToAdapt) {
        addToast("Adapting your goal for today...", 'info');
        const suggestion = await generateLowEnergySuggestion(habitToAdapt.title, language);
        setHabits(habits.map(h => h.id === habitToAdapt.id ? { ...h, microVersion: suggestion } : h));
      }
    }
    setShowDailyHuddle(false);
  };
  
  const handleNudge = (rippleId: string, message: string) => {
      if (!user) return;
      
      let recipientName = '';
      const updatedRipples = ripples.map(r => {
          if (r.id === rippleId) {
              if (r.nudges.some(n => n.fromUserName === user.name)) return r; // Already nudged
              const newNudge: Nudge = { fromUserName: user.name, message };
              recipientName = r.fromUserName;
              return { ...r, nudges: [...r.nudges, newNudge] };
          }
          return r;
      });

      setRipples(updatedRipples);

      // In a real app, this would be a push notification to the recipient.
      // Here, we simulate it with a toast if the recipient is not the current user.
      if (recipientName && recipientName !== user.name) {
          // This toast would not appear for the current user in a real scenario.
          // It's here to demonstrate the nudge was "sent".
          addToast(`You nudged ${recipientName}!`, 'success');
      }
  };

  const handleCompleteSquadQuest = (squadId: string, questId: string) => {
    if (!user) return;

    let completedQuest: SquadQuest | null = null;

    setSquads(squads => squads.map(s => {
      if (s.id === squadId && s.dailyQuests) {
        const quest = s.dailyQuests.quests.find(q => q.id === questId);
        if (quest && !quest.isCompleted) {
          completedQuest = { ...quest, isCompleted: true, completedBy: user.name };
          
          const newQuests = s.dailyQuests.quests.map(q => q.id === questId ? completedQuest : q);
          
          return {
            ...s,
            sharedMomentum: s.sharedMomentum + completedQuest.points,
            dailyQuests: {
              ...s.dailyQuests,
              quests: newQuests,
            }
          };
        }
      }
      return s;
    }));

    if (completedQuest) {
      addToast(`Quest Complete! +${completedQuest.points} Momentum for the squad.`, 'success');
      const newRipple: Ripple = {
        id: Date.now().toString(),
        squadId: squadId,
        fromUserName: user.name.split(' ')[0],
        habitTitle: completedQuest.title,
        identityTag: squads.find(s => s.id === squadId)?.goalIdentity || '',
        timestamp: new Date().toISOString(),
        nudges: [],
        isQuestCompletion: true,
        questPoints: completedQuest.points,
      };
      setRipples(prev => [newRipple, ...prev].slice(0, 20));
    }
  };

  const handleSendChatMessage = (squadId: string, text: string) => {
      if (!user) return;
      const newMessage: ChatMessage = {
          id: `${Date.now()}-${user.name}`,
          squadId,
          fromUserName: user.name,
          originalText: text,
          originalLanguage: user.language,
          translations: {},
          timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCreateTeamChallenge = (challenge: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => {
    if (!user || !user.teamId) return;

    const newChallenge: TeamChallenge = {
        ...challenge,
        id: `challenge-${Date.now()}`,
        currentCompletions: 0,
        isActive: true,
    };
    setTeamChallenges(prev => [...prev, newChallenge]);
    addToast("New Team Challenge created!", 'success');
  };


  if (!isLoaded) return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><p>Loading...</p></div>;
  if (isGeneratingHuddle && !dailyHuddleData) {
     return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-center">
        <div>
            <Icon name="sparkles" className="w-12 h-12 text-brand-primary mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold mt-4">Preparing your Daily Huddle...</h2>
        </div>
     </div>;
  }
  
  return (
    <>
      {user?.onboardingCompleted ? (
        <>
            <Dashboard 
                user={user} 
                habits={habits} 
                squads={squads}
                ripples={ripples}
                chatMessages={chatMessages}
                mission={mission}
                priorityHabitId={priorityHabitId}
                teams={teams}
                teamChallenges={teamChallenges}
                onAddHabit={handleAddHabit} 
                onCompleteHabit={handleCompleteHabit} 
                onDeleteHabit={handleDeleteHabit} 
                onUpdateUser={handleUpdateUser} 
                onSetPriorityHabit={handleSetPriorityHabit}
                levelUpInfo={levelUpInfo}
                onCloseLevelUpModal={() => setLevelUpInfo(null)}
                onEvolveHabit={handleEvolveHabit}
                onCreateSquad={handleCreateSquad}
                onRequestToJoinSquad={handleRequestToJoinSquad}
                onVoteOnJoinRequest={handleVoteOnJoinRequest}
                onVoteToKick={handleVoteToKick}
                dailyHuddleData={dailyHuddleData}
                showDailyHuddle={showDailyHuddle}
                onEnergySelect={handleEnergySelect}
                onNudge={handleNudge}
                onCompleteSquadQuest={handleCompleteSquadQuest}
                onSendChatMessage={handleSendChatMessage}
                onTriggerUpgrade={triggerUpgradeModal}
                onCreateTeamChallenge={handleCreateTeamChallenge}
            />
            {showDailyHuddle && dailyHuddleData && user && (
                <Chatbot 
                    user={user} 
                    habits={habits} 
                    mode="huddle"
                    huddleData={dailyHuddleData}
                    onClose={() => setShowDailyHuddle(false)}
                    onHuddleComplete={handleEnergySelect}
                />
            )}
        </>
      ) : (
        <Onboarding 
            onComplete={handleOnboardingComplete} 
            onTriggerUpgrade={triggerUpgradeModal}
        />
      )}
      <div className="fixed top-4 right-4 z-[100] w-full max-w-sm">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
        ))}
      </div>
       {showUpgradeModal && (
        <UpgradeModal 
            reason={upgradeReason}
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={handleSimulateUpgrade}
        />
       )}
    </>
  );
};

export default App;
