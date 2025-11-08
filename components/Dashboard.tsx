import React, { useState, useMemo, useContext } from 'react';
import { Habit, User, Squad, Team, Financials, Mission, MentorIntervention, AssistRequest } from '../types';
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
import { getTodayDateString } from '../utils/date';
import { MOCK_SQUADS, MOCK_TEAMS, MOCK_FINANCIALS, MOCK_QUESTS, MOCK_SAGA, MOCK_CHAT, MOCK_CHALLENGES, MOCK_ASSIST_REQUESTS } from '../App';

interface DashboardProps {
  user: User;
  habits: Habit[];
  onUpdateUser: (user: User) => void;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>) => void;
  onUpdateHabit: (updatedHabit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onSignOut: () => void;
  onTriggerUpgrade: (reason: string) => void;
  onShowPrivacyPolicy: () => void;
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
}) => {
  const { t } = useContext(LanguageContext)!;
  const [showHabitBuilder, setShowHabitBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showDailyDebrief, setShowDailyDebrief] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [assistRequest, setAssistRequest] = useState<AssistRequest | null>(MOCK_ASSIST_REQUESTS.length > 0 ? MOCK_ASSIST_REQUESTS[0] : null);

  const todayStr = getTodayDateString();
  const hasDebriefedToday = user.dailyDebriefs.some(d => d.date === todayStr);

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
        
        {user.subscription.plan === 'team' && <FinancialsWidget financials={MOCK_FINANCIALS} allUsers={[]} teams={MOCK_TEAMS} />}

        <IdentityStatus identities={user.selectedIdentities} />
        
        {intervention && <MomentumMentorWidget intervention={intervention} onAccept={() => {}} onDismiss={() => {}} />}
        {mission && <MomentumMissionCard mission={mission} habitTitle={habits.find(h => h.id === mission.targetHabitId)?.title || ''} />}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('dashboard.habits.title')}</h2>
            <button onClick={() => setShowWeeklyReview(true)} className="text-sm font-semibold text-brand-primary hover:underline">
              {t('dashboard.habits.weeklyReview')}
            </button>
          </div>
          <div className="space-y-3">
            {habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} onComplete={() => {}} onUndo={() => {}} onDelete={() => setHabitToDelete(habit)} />
            ))}
             <button
                onClick={() => {
                    if (habits.length < 5) {
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

      {showHabitBuilder && <HabitBuilder user={user} onAddHabit={onAddHabit} onClose={() => setShowHabitBuilder(false)} />}
      {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} onUpdateUser={onUpdateUser} onDeleteAccount={onSignOut} onShowPrivacyPolicy={onShowPrivacyPolicy} />}
      {showWeeklyReview && <WeeklyReview habits={habits} onClose={() => setShowWeeklyReview(false)} />}
      {showDailyDebrief && <DailyDebriefModal user={user} habits={habits} onClose={() => setShowDailyDebrief(false)} onSave={() => {}} />}
      {habitToDelete && <DeleteConfirmation habitTitle={habitToDelete.title} onConfirm={() => { onDeleteHabit(habitToDelete.id); setHabitToDelete(null); }} onCancel={() => setHabitToDelete(null)} />}
      {assistRequest && <OfferAssistModal requesterName={assistRequest.requesterName} requesterIdentity={assistRequest.requesterIdentity} habitTitle={assistRequest.habitTitle} onClose={() => setAssistRequest(null)} onSendAssist={() => {}} />}
    </div>
  );
};
