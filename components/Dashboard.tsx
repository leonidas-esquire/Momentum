import React, { useState, useMemo, useContext } from 'react';
import { Habit, User, Squad, Team, Financials, Mission, MentorIntervention, AssistRequest, DailyDebrief, ChatMessage } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { Icon } from './Icon';
import { HabitCard } from './HabitCard';
import { HabitBuilder } from './HabitBuilder';
import { IdentityStatus } from './IdentityStatus';
import { SquadHub } from './SquadHub';
import { TeamHub } from './TeamHub';
import { FinancialsWidget } from './FinancialsWidget';
import { MomentumMissionCard } from './MomentumMissionCard';
import { MomentumMentorWidget } from './MomentumMentorWidget';
import { SettingsModal } from './SettingsModal';
import { WeeklyReview } from './WeeklyReview';
import { DeleteConfirmation } from './DeleteConfirmation';
import { OfferAssistModal } from './OfferAssistModal';
import { DailyDebriefModal } from './DailyDebriefModal';
import { ProgressAnalysisModal } from './ProgressAnalysisModal';
import { getTodayDateString, isToday, isYesterday } from '../utils/date';
import { MOCK_SQUADS, MOCK_TEAMS, MOCK_FINANCIALS, MOCK_QUESTS, MOCK_SAGA, MOCK_CHAT, MOCK_CHALLENGES, MOCK_ASSIST_REQUESTS } from '../App';
import { PlaybookModal } from './PlaybookModal';

interface DashboardProps {
  user: User;
  habits: Habit[];
  onUpdateUser: (user: User) => void;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays'>) => void;
  onUpdateHabit: (updatedHabit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onSignOut: () => void;
  onTriggerUpgrade: (reason: string) => void;
  onShowPrivacyPolicy: () => void;
  onShowTermsOfService: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  habits,
  onUpdateUser,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
  onSignOut,
  onTriggerUpgrade,
  onShowPrivacyPolicy,
  onShowTermsOfService,
}) => {
  const { t } = useContext(LanguageContext)!;
  const [showHabitBuilder, setShowHabitBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showDailyDebrief, setShowDailyDebrief] = useState(false);
  const [showProgressAnalysis, setShowProgressAnalysis] = useState(false);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [assistRequest, setAssistRequest] = useState<AssistRequest | null>(MOCK_ASSIST_REQUESTS.length > 0 ? MOCK_ASSIST_REQUESTS[0] : null);

  const todayStr = getTodayDateString();
  const hasDebriefedToday = user.dailyDebriefs.some(d => d.date === todayStr);

  const locationHabits = useMemo(() => {
    return habits.filter(h => h.reminder?.type === 'location' && !isToday(h.lastCompleted));
  }, [habits]);

  const handleContextualTrigger = (location: 'home' | 'work') => {
      const habitsToNotify = locationHabits.filter(h => h.reminder?.location === location);
      if (habitsToNotify.length > 0) {
          const habitTitles = habitsToNotify.map(h => `"${h.title}"`).join(', ');
          new Notification('Momentum Contextual Reminder', {
              body: `Welcome ${location}! Time for your habits: ${habitTitles}`,
              icon: '/vite.svg',
          });
      }
  };


  const handleSaveDebrief = (debrief: DailyDebrief, sharedWin: string | null) => {
    const updatedUser = {
      ...user,
      dailyDebriefs: [...user.dailyDebriefs, debrief],
    };
    onUpdateUser(updatedUser);

    if (sharedWin && user.squadId) {
      const chatMessage: ChatMessage = {
        id: `chat-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        text: sharedWin,
        timestamp: Date.now(),
        isHuddleMessage: true,
      };
      MOCK_CHAT.push(chatMessage);
    }
    setShowDailyDebrief(false);
  };

  const handleCompleteHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit || isToday(habit.lastCompleted)) return;

    const now = new Date();
    const todayISO = now.toISOString();

    let newStreak = habit.streak;
    if (habit.lastCompleted && isYesterday(habit.lastCompleted)) {
        newStreak += 1;
    } else {
        newStreak = 1; // Reset or start streak
    }

    const updatedHabit: Habit = {
        ...habit,
        lastCompleted: todayISO,
        completions: [...habit.completions, todayISO],
        streak: newStreak,
        longestStreak: Math.max(habit.longestStreak, newStreak),
        missedDays: 0,
    };
    onUpdateHabit(updatedHabit);

    // Award XP
    const identityIndex = user.selectedIdentities.findIndex(i => i.name === habit.identityTag);
    if (identityIndex > -1) {
        const newIdentities = [...user.selectedIdentities];
        const identity = newIdentities[identityIndex];
        const newXp = identity.xp + 10; // Award 10 XP
        const xpForNextLevel = identity.level * 100;
        if (newXp >= xpForNextLevel) {
            identity.level += 1;
            identity.xp = newXp - xpForNextLevel;
        } else {
            identity.xp = newXp;
        }
        onUpdateUser({ ...user, selectedIdentities: newIdentities });
    }
  };

  const handleUndoHabit = (id: string) => {
      const habit = habits.find(h => h.id === id);
      if (!habit || !isToday(habit.lastCompleted)) return;

      const newCompletions = habit.completions.slice(0, -1);
      const newLastCompleted = newCompletions.length > 0 ? newCompletions[newCompletions.length - 1] : null;

      const updatedHabit: Habit = {
          ...habit,
          lastCompleted: newLastCompleted,
          completions: newCompletions,
          streak: habit.streak > 0 ? habit.streak - 1 : 0,
      };
      onUpdateHabit(updatedHabit);

      // Remove XP
      const identityIndex = user.selectedIdentities.findIndex(i => i.name === habit.identityTag);
      if (identityIndex > -1) {
          const newIdentities = [...user.selectedIdentities];
          newIdentities[identityIndex].xp = Math.max(0, newIdentities[identityIndex].xp - 10);
          onUpdateUser({ ...user, selectedIdentities: newIdentities });
      }
  };

  const handleToggleFavorite = (id: string) => {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;
      onUpdateHabit({ ...habit, isFavorite: !habit.isFavorite });
  };
  
  const handleEditHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      setHabitToEdit(habit);
      setShowHabitBuilder(true);
    }
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays'> | Habit) => {
    if ('id' in habitData) {
      onUpdateHabit(habitData as Habit);
    } else {
      onAddHabit(habitData);
    }
  };

  const handleStartVoiceNote = (id: string) => {
      console.log("Voice note feature for habit:", id);
      alert("Voice notes coming soon!");
  };

  const mission: Mission | null = useMemo(() => {
    if (habits.length === 0) return null;
    const mostConsistentHabit = habits.reduce((prev, current) => (prev.streak > current.streak) ? prev : current, habits[0]);
    if (!mostConsistentHabit || mostConsistentHabit.streak < 3) return null;
    return {
      id: 'mission1',
      title: '7-Day Masterclass',
      description: 'Solidify your top habit by hitting a 7-day streak.',
      targetHabitId: mostConsistentHabit.id,
      targetCompletions: 7,
      currentCompletions: mostConsistentHabit.streak,
    };
  }, [habits]);

  const intervention: MentorIntervention | null = useMemo(() => {
    const strugglingHabit = habits.find(h => h.missedDays > 2);
    if (!strugglingHabit) return null;
    return {
        habitId: strugglingHabit.id,
        message: `It looks like you're finding it tough to stick with "${strugglingHabit.title}". How about we break it down into a smaller first step?`,
        microHabit: { title: `Prepare for "${strugglingHabit.title}"` }
    };
  }, [habits]);

  const userSquad = useMemo(() => MOCK_SQUADS.find(s => s.id === user.squadId), [user.squadId]);
  const userTeam = useMemo(() => MOCK_TEAMS.find(t => t.id === user.teamId), [user.teamId]);

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        const aCompleted = isToday(a.lastCompleted);
        const bCompleted = isToday(b.lastCompleted);
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        return 0;
    });
  }, [habits]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="bg-brand-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-brand-secondary">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Momentum</h1>
          <div className="flex items-center gap-4">
            <button
                onClick={() => setShowDailyDebrief(true)}
                disabled={hasDebriefedToday}
                className="bg-brand-primary/20 text-brand-primary font-bold py-2 px-4 rounded-full text-sm hover:bg-brand-primary/40 disabled:bg-brand-secondary/20 disabled:text-brand-text-muted disabled:cursor-not-allowed transition-colors"
            >
                {hasDebriefedToday ? t('dashboard.debriefedButton') : t('dashboard.debriefButton')}
            </button>
            <button onClick={() => setShowSettings(true)} className="text-brand-text-muted hover:text-white">
                <Icon name="cog" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        <h2 className="text-3xl font-bold">{t('dashboard.welcome', { name: user.name })}</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
            {locationHabits.some(h => h.reminder?.location === 'home') && (
                <button onClick={() => handleContextualTrigger('home')} className="flex-1 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg p-3 text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
                    <Icon name="map-pin" className="w-5 h-5" /> I've Arrived Home
                </button>
            )}
            {locationHabits.some(h => h.reminder?.location === 'work') && (
                <button onClick={() => handleContextualTrigger('work')} className="flex-1 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg p-3 text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
                    <Icon name="map-pin" className="w-5 h-5" /> I've Arrived at Work
                </button>
            )}
        </div>

        {user.subscription.plan === 'team' && <FinancialsWidget financials={MOCK_FINANCIALS} allUsers={[]} teams={MOCK_TEAMS} />}

        <IdentityStatus identities={user.selectedIdentities} />
        
        {intervention && <MomentumMentorWidget intervention={intervention} onAccept={() => {}} onDismiss={() => {}} />}
        {mission && <MomentumMissionCard mission={mission} habitTitle={habits.find(h => h.id === mission.targetHabitId)?.title || ''} />}

        <div>
          <div className="flex justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold">{t('dashboard.habits.title')}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowProgressAnalysis(true)} className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1">
                <Icon name="sparkles" className="w-4 h-4" /> {t('dashboard.habits.aiReport')}
              </button>
              <button onClick={() => setShowWeeklyReview(true)} className="text-sm font-semibold text-brand-primary hover:underline">
                {t('dashboard.habits.weeklyReview')}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {sortedHabits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onComplete={handleCompleteHabit} 
                onUndo={handleUndoHabit} 
                onDelete={() => setHabitToDelete(habit)}
                onToggleFavorite={handleToggleFavorite}
                onStartVoiceNote={handleStartVoiceNote}
                onEdit={handleEditHabit}
              />
            ))}
             <button
                onClick={() => {
                    if (habits.length < 5) {
                        setHabitToEdit(null);
                        setShowHabitBuilder(true);
                    } else {
                        onTriggerUpgrade('habit');
                    }
                }}
                className="w-full bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg p-4 text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="plus" className="w-5 h-5" /> {t('dashboard.habits.add')}
              </button>
          </div>
        </div>
        
        {userSquad && <SquadHub user={user} squad={userSquad} quests={MOCK_QUESTS} saga={MOCK_SAGA} chatMessages={MOCK_CHAT} onCompleteQuest={() => {}} onContributeToSaga={() => {}} onSendMessage={() => {}} />}
        {userTeam && <TeamHub team={userTeam} challenges={MOCK_CHALLENGES} currentUserId={user.id} />}
        
      </main>

      {showHabitBuilder && <HabitBuilder 
        user={user} 
        habitToEdit={habitToEdit}
        onSaveHabit={handleSaveHabit} 
        onClose={() => {
            setShowHabitBuilder(false);
            setHabitToEdit(null);
        }} 
      />}
      {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} onUpdateUser={onUpdateUser} onDeleteAccount={onSignOut} onShowPrivacyPolicy={onShowPrivacyPolicy} onShowTermsOfService={onShowTermsOfService} onShowPlaybook={() => setShowPlaybook(true)} />}
      {showWeeklyReview && <WeeklyReview habits={habits} onClose={() => setShowWeeklyReview(false)} />}
      {showDailyDebrief && <DailyDebriefModal user={user} habits={habits} onClose={() => setShowDailyDebrief(false)} onSave={handleSaveDebrief} />}
      {showProgressAnalysis && <ProgressAnalysisModal user={user} habits={habits} onClose={() => setShowProgressAnalysis(false)} />}
      {showPlaybook && <PlaybookModal onClose={() => setShowPlaybook(false)} />}
      {habitToDelete && <DeleteConfirmation habitTitle={habitToDelete.title} onConfirm={() => { onDeleteHabit(habitToDelete.id); setHabitToDelete(null); }} onCancel={() => setHabitToDelete(null)} />}
      {assistRequest && <OfferAssistModal 
        requesterName={assistRequest.requesterName} 
        requesterIdentity={assistRequest.requesterIdentity} 
        habitTitle={assistRequest.habitTitle} 
        onClose={() => setAssistRequest(null)} 
        onSendAssist={(message: string) => {
            console.log(`Assist message sent to ${assistRequest.requesterName}: "${message}"`);
            setAssistRequest(null);
        }} 
      />}
    </div>
  );
};