import React, { useState, useMemo, useEffect, useContext } from 'react';
import { User, Habit, UserIdentity, Squad, Ripple, Mission, DailyHuddleData } from '../types';
import { HabitCard } from './HabitCard';
import { HabitBuilder } from './HabitBuilder';
import { WeeklyReview } from './WeeklyReview';
import { DeleteConfirmation } from './DeleteConfirmation';
import { Icon } from './Icon';
import { IdentityStatus } from './IdentityStatus';
import { LevelUpModal } from './LevelUpModal';
import { Chatbot } from './Chatbot';
import { SquadHub } from './SquadHub';
import { SquadBuilder } from './SquadBuilder';
import { MomentumMissionCard } from './MomentumMissionCard';
import { DailyHuddle } from './DailyHuddle';
import { generateSquadInvitationEmail, generateMembershipPitch } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../constants';

interface InviteModalProps {
  user: User;
  squad: Squad;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ user, squad, onClose }) => {
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [copyLinkStatus, setCopyLinkStatus] = useState<'idle' | 'copied'>('idle');
  const { language } = useContext(LanguageContext)!;

  const inviteLink = `https://momentum.app/join?squadId=${squad.id}`;

  useEffect(() => {
    generateSquadInvitationEmail(squad.name, user.name.split(' ')[0], squad.goalIdentity, language)
      .then(content => {
        setEmailContent(content);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [squad.name, user.name, squad.goalIdentity, squad.id, language]);
  
  const handleCopyToClipboard = (text: string, type: 'email' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
        if (type === 'email') {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } else {
            setCopyLinkStatus('copied');
            setTimeout(() => setCopyLinkStatus('idle'), 2000);
        }
    });
  };

  const fullEmailBody = emailContent ? `Subject: ${emailContent.subject}\n\n${emailContent.body}` : '';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Invite to "{squad.name}"</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
              <div className="h-8 bg-brand-bg rounded-md animate-pulse w-3/4"></div>
              <div className="h-40 bg-brand-bg rounded-md animate-pulse"></div>
          </div>
        ) : emailContent ? (
          <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-brand-text">Your AI-Generated Invitation</h3>
                <p className="text-sm text-brand-text-muted mb-4">Copy this compelling email and send it to a friend who shares your ambition.</p>
                <div className="bg-brand-bg p-4 rounded-lg border border-brand-secondary max-h-60 overflow-y-auto">
                    <p className="font-semibold text-brand-text mb-2">Subject: {emailContent.subject}</p>
                    <pre className="text-brand-text-muted text-sm whitespace-pre-wrap font-sans">{emailContent.body}</pre>
                </div>
                <button
                    onClick={() => handleCopyToClipboard(fullEmailBody, 'email')}
                    className="mt-4 w-full bg-brand-primary/20 text-brand-primary font-bold py-3 px-6 rounded-full text-base hover:bg-brand-primary/40 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    <Icon name={copyStatus === 'copied' ? 'check' : 'clipboard-document'} className="w-5 h-5"/>
                    {copyStatus === 'copied' ? 'Copied to Clipboard!' : 'Copy Email Content'}
                </button>
            </div>
            <div>
                 <h3 className="text-lg font-semibold mb-2 text-brand-text">Your Unique Invite Link</h3>
                 <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <button
                        onClick={() => handleCopyToClipboard(inviteLink, 'link')}
                        className="bg-brand-secondary text-white font-bold p-3 rounded-lg hover:bg-opacity-80 transition-colors duration-300"
                    >
                         <Icon name={copyLinkStatus === 'copied' ? 'check' : 'clipboard-document'} className="w-5 h-5"/>
                    </button>
                 </div>
            </div>
          </div>
        ) : (
            <p className="text-brand-text-muted text-center">Could not generate an invitation. Please try again later.</p>
        )}
      </div>
    </div>
  );
};

interface RequestToJoinModalProps {
    user: User;
    squad: Squad;
    onClose: () => void;
    onRequest: (pitch: string) => void;
}
  
const RequestToJoinModal: React.FC<RequestToJoinModalProps> = ({ user, squad, onClose, onRequest }) => {
    const [pitch, setPitch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useContext(LanguageContext)!;
  
    const handleGeneratePitch = () => {
      setIsLoading(true);
      generateMembershipPitch(user.name, squad.name, squad.goalIdentity, language)
        .then(setPitch)
        .finally(() => setIsLoading(false));
    };
  
    useEffect(handleGeneratePitch, [user.name, squad.name, squad.goalIdentity, language]);
  
    const handleSubmit = () => {
      if (pitch.trim()) {
        onRequest(pitch.trim());
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
        <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Request to Join "{squad.name}"</h2>
            <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
          </div>
          <p className="text-brand-text-muted mb-4">Write a short pitch to the squad explaining why you'd be a great addition to their team.</p>
          
          <div className="relative">
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Your pitch..."
              className="w-full h-40 bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
              disabled={isLoading}
            />
            {isLoading && <div className="absolute inset-0 bg-brand-bg/50 rounded-lg animate-pulse"></div>}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <button
              onClick={handleGeneratePitch}
              disabled={isLoading}
              className="w-full sm:w-auto bg-brand-secondary text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-opacity-80 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Icon name="sparkles" className="w-4 h-4" /> Rewrite with AI
            </button>
            <div className="flex gap-4">
                <button onClick={onClose} className="text-brand-text-muted font-bold py-3 px-6 rounded-full hover:bg-brand-secondary/20">Cancel</button>
                <button
                onClick={handleSubmit}
                disabled={!pitch.trim() || isLoading}
                className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 disabled:bg-brand-secondary"
                >
                Send Request
                </button>
            </div>
          </div>
        </div>
      </div>
    );
};

interface DashboardProps {
  user: User;
  habits: Habit[];
  squads: Squad[];
  ripples: Ripple[];
  mission: Mission | null;
  priorityHabitId: string | null;
  dailyHuddleData: DailyHuddleData | null;
  showDailyHuddle: boolean;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions'>) => void;
  onCompleteHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateUser: (user: User) => void;
  onSetPriorityHabit: (habitId: string) => void;
  levelUpInfo: { identity: UserIdentity; habit: Habit } | null;
  onCloseLevelUpModal: () => void;
  onEvolveHabit: (habitId: string, newTitle: string) => void;
  onCreateSquad: (name: string, goalIdentity: string) => void;
  onRequestToJoinSquad: (squadId: string, pitch: string) => void;
  onVoteOnJoinRequest: (squadId: string, requestUserName: string, vote: 'approve' | 'deny') => void;
  onVoteToKick: (squadId: string, targetUserName: string) => void;
  onEnergySelect: (energy: 'low' | 'medium' | 'high') => void;
}

const isToday = (someDate: string | null) => {
    if (!someDate) return false;
    const today = new Date();
    const date = new Date(someDate);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, habits, squads, ripples, priorityHabitId, mission, onAddHabit, onCompleteHabit, onDeleteHabit, onUpdateUser, onSetPriorityHabit,
  levelUpInfo, onCloseLevelUpModal, onEvolveHabit, onCreateSquad, onRequestToJoinSquad, onVoteOnJoinRequest, onVoteToKick,
  dailyHuddleData, showDailyHuddle, onEnergySelect
}) => {
  const [showHabitBuilder, setShowHabitBuilder] = useState(false);
  const [showSquadBuilder, setShowSquadBuilder] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [squadToRequest, setSquadToRequest] = useState<Squad | null>(null);
  const { language, setLanguage, t } = useContext(LanguageContext)!;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    onUpdateUser({ ...user, language: newLang });
  };
  
  const firstName = user.name.split(' ')[0];
  const formattedDate = new Intl.DateTimeFormat(language, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editedName.trim()) {
      onUpdateUser({ ...user, name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditedName(user.name);
    setIsEditingName(false);
  };

  const handleInitiateDelete = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setHabitToDelete(habit);
    }
  };

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      onDeleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setHabitToDelete(null);
  };
  
  const priorityHabit = useMemo(() => {
    if (habits.length === 0) return null;
    if (priorityHabitId) {
      const p = habits.find(h => h.id === priorityHabitId);
      if (p) return p;
    }
    return habits.reduce((prev, current) => (prev.streak >= current.streak ? prev : current));
  }, [habits, priorityHabitId]);

  const regularHabits = habits.filter(h => h.id !== priorityHabit?.id);
  const morningHabits = regularHabits.filter(h => h.cue === 'In the morning');
  const afternoonHabits = regularHabits.filter(h => h.cue === 'During my lunch break' || h.cue === 'After my workout');
  const eveningHabits = regularHabits.filter(h => h.cue === 'Before bed');

  const currentUserSquad = useMemo(() => {
    return squads.find(s => s.id === user.squadId) || null;
  }, [squads, user.squadId]);
  
  const squadRipples = useMemo(() => {
    return ripples.filter(r => r.squadId === user.squadId);
  }, [ripples, user.squadId]);

  const missionHabitTitle = useMemo(() => {
    if (!mission) return '';
    return habits.find(h => h.id === mission.habitId)?.title || '';
  }, [mission, habits]);

  const mostImportantHabit = useMemo(() => {
      if (!dailyHuddleData) return null;
      return habits.find(h => h.id === dailyHuddleData.mostImportantHabitId) || null;
  }, [dailyHuddleData, habits]);

  return (
    <>
      <div className="min-h-screen bg-brand-bg text-brand-text p-4 md:p-8">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-start">
          <div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-brand-surface border border-brand-secondary rounded-lg px-2 py-1 text-3xl md:text-4xl font-bold w-full"
                  autoFocus
                />
                <button type="submit" className="p-2 bg-brand-safe rounded-full text-white hover:bg-opacity-80 flex-shrink-0"><Icon name="check" className="w-5 h-5"/></button>
                <button type="button" onClick={handleCancelEditName} className="p-2 bg-brand-danger rounded-full text-white hover:bg-opacity-80 flex-shrink-0"><Icon name="close" className="w-5 h-5"/></button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">{t('dashboard.header.title', { name: firstName })}</h1>
                <button onClick={() => { setIsEditingName(true); setEditedName(user.name); }} className="text-brand-text-muted hover:text-white p-1 rounded-full hover:bg-brand-surface">
                    <Icon name="pencil" className="w-5 h-5"/>
                </button>
              </div>
            )}
            <p className="text-brand-text-muted">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
             <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-brand-surface border border-brand-secondary text-brand-text font-semibold py-2 px-3 rounded-full text-sm hover:bg-brand-secondary transition-colors duration-300 appearance-none"
             >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name.split('(')[0].trim()}</option>
                ))}
            </select>
            <button 
                onClick={() => setShowWeeklyReview(true)}
                className="bg-brand-surface border border-brand-secondary text-brand-text font-semibold py-2 px-4 rounded-full text-sm hover:bg-brand-secondary transition-colors duration-300"
            >
                {t('dashboard.header.weeklyReview')}
            </button>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto">
          {mission && !mission.isCompleted && <MomentumMissionCard mission={mission} habitTitle={missionHabitTitle} />}
          
          <IdentityStatus identities={user.selectedIdentities} />
          
          <div className="mt-8">
              <SquadHub 
                user={user}
                squad={currentUserSquad} 
                allSquads={squads} 
                ripples={squadRipples} 
                onOpenSquadBuilder={() => setShowSquadBuilder(true)}
                onOpenInviteModal={() => setShowInviteModal(true)}
                onOpenRequestModal={(squad) => setSquadToRequest(squad)}
                onVoteOnRequest={onVoteOnJoinRequest}
                onVoteToKick={onVoteToKick}
              />
          </div>

          <div className="space-y-8 mt-8">
              {habits.length === 0 ? (
                  <div className="text-center bg-brand-surface border border-brand-secondary rounded-xl p-8">
                      <h2 className="text-xl font-semibold mb-2">{t('dashboard.empty.title')}</h2>
                      <p className="text-brand-text-muted mb-6">{t('dashboard.empty.message')}</p>
                      <button onClick={() => setShowHabitBuilder(true)} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                          <Icon name="plus" className="w-5 h-5"/> {t('dashboard.empty.button')}
                      </button>
                  </div>
              ) : (
                  <>
                      {priorityHabit && (
                          <div>
                              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                  <Icon name="star" solid className="w-5 h-5 text-yellow-400" />
                                  {t('dashboard.focus.title')}
                              </h2>
                              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-1">
                                  <HabitCard 
                                      key={priorityHabit.id} 
                                      habit={priorityHabit} 
                                      onComplete={onCompleteHabit} 
                                      onDelete={handleInitiateDelete} 
                                      isCompletedToday={isToday(priorityHabit.lastCompleted)}
                                      isPriority={priorityHabit.id === priorityHabitId || !priorityHabitId}
                                      onSetPriority={onSetPriorityHabit}
                                  />
                              </div>
                          </div>
                      )}
                      {morningHabits.length > 0 && (
                          <div>
                              <h2 className="text-xl font-bold mb-4">{t('dashboard.time.morning')}</h2>
                              <div className="space-y-4">
                                  {morningHabits.map(habit => (
                                      <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onDelete={handleInitiateDelete} isCompletedToday={isToday(habit.lastCompleted)} isPriority={habit.id === priorityHabitId} onSetPriority={onSetPriorityHabit}/>
                                  ))}
                              </div>
                          </div>
                      )}
                      {afternoonHabits.length > 0 && (
                          <div>
                              <h2 className="text-xl font-bold mb-4">{t('dashboard.time.afternoon')}</h2>
                              <div className="space-y-4">
                                  {afternoonHabits.map(habit => (
                                      <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onDelete={handleInitiateDelete} isCompletedToday={isToday(habit.lastCompleted)} isPriority={habit.id === priorityHabitId} onSetPriority={onSetPriorityHabit}/>
                                  ))}
                              </div>
                          </div>
                      )}
                      {eveningHabits.length > 0 && (
                          <div>
                              <h2 className="text-xl font-bold mb-4">{t('dashboard.time.evening')}</h2>
                              <div className="space-y-4">
                                  {eveningHabits.map(habit => (
                                      <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onDelete={handleInitiateDelete} isCompletedToday={isToday(habit.lastCompleted)} isPriority={habit.id === priorityHabitId} onSetPriority={onSetPriorityHabit}/>
                                  ))}
                              </div>
                          </div>
                      )}
                      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
                          <button onClick={() => setIsChatbotOpen(true)} className="bg-brand-secondary text-white rounded-full p-4 shadow-lg hover:bg-opacity-80 transition-transform duration-200 hover:scale-110">
                              <Icon name="microphone" solid className="w-8 h-8" />
                          </button>
                          <button onClick={() => setShowHabitBuilder(true)} className="bg-brand-primary text-white rounded-full p-4 shadow-lg hover:bg-opacity-80 transition-transform duration-200 hover:scale-110">
                              <Icon name="plus" className="w-8 h-8" />
                          </button>
                      </div>
                  </>
              )}
          </div>
        </main>
      </div>

      {showHabitBuilder && <HabitBuilder user={user} onAddHabit={onAddHabit} onClose={() => setShowHabitBuilder(false)} />}
      {showSquadBuilder && <SquadBuilder user={user} onCreateSquad={onCreateSquad} onClose={() => setShowSquadBuilder(false)} />}
      {showWeeklyReview && <WeeklyReview habits={habits} onClose={() => setShowWeeklyReview(false)} />}
      {habitToDelete && <DeleteConfirmation habitTitle={habitToDelete.title} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
      {levelUpInfo && <LevelUpModal identity={levelUpInfo.identity} habitToEvolve={levelUpInfo.habit} onEvolve={onEvolveHabit} onClose={onCloseLevelUpModal} />}
      {isChatbotOpen && <Chatbot user={user} habits={habits} onClose={() => setIsChatbotOpen(false)} />}
      
      {showDailyHuddle && dailyHuddleData && mostImportantHabit && (
        <DailyHuddle 
          huddle={dailyHuddleData} 
          mostImportantHabit={mostImportantHabit} 
          onEnergySelect={onEnergySelect} 
        />
      )}

      {showInviteModal && currentUserSquad && (
        <InviteModal 
            user={user} 
            squad={currentUserSquad} 
            onClose={() => setShowInviteModal(false)} 
        />
      )}
      {squadToRequest && (
        <RequestToJoinModal
            user={user}
            squad={squadToRequest}
            onClose={() => setSquadToRequest(null)}
            onRequest={(pitch) => {
                onRequestToJoinSquad(squadToRequest.id, pitch);
                setSquadToRequest(null);
            }}
        />
      )}
    </>
  );
};
