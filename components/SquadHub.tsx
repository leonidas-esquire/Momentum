import React, { useState, useContext, useMemo } from 'react';
import { User, Squad, Ripple, ChatMessage, Habit } from '../types';
import { Icon } from './Icon';
import { SquadQuestCard } from './SquadQuestCard';
import { ChatInterface } from './ChatInterface';
import { SquadSagaWidget } from './SquadSagaWidget';
import { findMatchingSquads } from '../services/squadService';
import { LanguageContext } from '../contexts/LanguageContext';
import { OfferAssistModal } from './OfferAssistModal';

interface SquadHubProps {
  user: User;
  isProUser: boolean;
  squad: Squad | null;
  allSquads: Squad[];
  ripples: Ripple[];
  chatMessages: ChatMessage[];
  habits: Habit[];
  priorityHabitId: string | null;
  onOpenSquadBuilder: () => void;
  onOpenInviteModal: () => void;
  onOpenRequestModal: (squad: Squad) => void;
  onVoteOnRequest: (squadId: string, requestUserName: string, vote: 'approve' | 'deny') => void;
  onVoteToKick: (squadId: string, targetUserName: string) => void;
  onNudge: (rippleId: string, message: string) => void;
  onCompleteQuest: (squadId: string, questId: string) => void;
  onSendChatMessage: (squadId: string, text: string) => void;
  onTriggerUpgrade: (reason: string) => void;
  onProposeSquadNameChange: (squadId: string, newName: string) => void;
  onVoteForSquadNameChange: (squadId: string) => void;
  onContributeMomentumToSaga: (squadId: string) => void;
}

const SquadCard: React.FC<{ squad: Squad, onRequest: () => void }> = ({ squad, onRequest }) => {
    return (
        <div className="bg-brand-bg p-4 rounded-lg border border-brand-secondary flex justify-between items-center">
            <div>
                <p className="font-bold">{squad.name}</p>
                <p className="text-sm text-brand-text-muted">{squad.members.length} / 5 members - Goal: {squad.goalIdentity}</p>
            </div>
            <button onClick={onRequest} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-full text-sm">Join</button>
        </div>
    );
};

const AssistRequestRipple: React.FC<{ ripple: Ripple, onOfferAssist: () => void }> = ({ ripple, onOfferAssist }) => {
    const { t } = useContext(LanguageContext)!;
    const { authorName, message, nudges, isResolved } = ripple;

    return (
        <div className={`bg-brand-bg border-2 rounded-xl p-4 transition-opacity duration-500 ${isResolved ? 'border-brand-safe/30 opacity-60' : 'border-dashed border-brand-primary/80'}`}>
            <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${isResolved ? 'bg-brand-safe/20' : 'bg-brand-primary/20'}`}>
                    <Icon name={isResolved ? 'check' : 'shield'} className={`w-6 h-6 ${isResolved ? 'text-brand-safe' : 'text-brand-primary'}`} />
                </div>
                <div>
                    <p className="text-brand-text">
                        <span className="font-bold">{authorName}</span> {message}
                    </p>
                </div>
            </div>
            {nudges.length > 0 && (
                <div className="pl-12 mt-2 space-y-1">
                    {nudges.map((nudge, i) => (
                        <p key={i} className="text-xs text-brand-text-muted italic">
                            <span className="font-semibold not-italic text-brand-primary/80">{nudge.nudgerName}</span> sent a boost: "{nudge.message}"
                        </p>
                    ))}
                </div>
            )}
            {!isResolved && (
                <div className="pl-12 mt-3">
                    <button onClick={onOfferAssist} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-opacity-80">
                        {t('dashboard.assist.offerButton')}
                    </button>
                </div>
            )}
        </div>
    )
}

export const SquadHub: React.FC<SquadHubProps> = (props) => {
    const { user, isProUser, squad, allSquads, ripples, chatMessages, habits, priorityHabitId, onOpenSquadBuilder, onOpenInviteModal, onOpenRequestModal, onVoteOnRequest, onVoteToKick, onNudge, onCompleteQuest, onSendChatMessage, onTriggerUpgrade, onProposeSquadNameChange, onVoteForSquadNameChange, onContributeMomentumToSaga } = props;
    const { t } = useContext(LanguageContext)!;
    const [activeTab, setActiveTab] = useState<'ripples' | 'chat' | 'saga' | 'quests'>('ripples');
    const [isProposingName, setIsProposingName] = useState(false);
    const [proposedName, setProposedName] = useState('');
    const [assistRequestToHelp, setAssistRequestToHelp] = useState<Ripple | null>(null);
    
    const suggestedSquads = findMatchingSquads(user, allSquads);

    const priorityHabit = useMemo(() => {
        if (!priorityHabitId) return habits.reduce((prev, current) => (prev.streak > current.streak ? prev : current), habits[0]);
        return habits.find(h => h.id === priorityHabitId) || habits[0];
    }, [habits, priorityHabitId]);

    if (!isProUser) {
        return (
            <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6 text-center">
                <Icon name="users" className="w-10 h-10 mx-auto text-brand-primary mb-4" />
                <h3 className="text-xl font-bold">{t('squadHub.upgradeTitle')}</h3>
                <p className="text-brand-text-muted mb-6">{t('squadHub.upgradeMessage')}</p>
                <button onClick={() => onTriggerUpgrade('squads')} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                    <Icon name="sparkles" className="w-5 h-5"/> {t('squadHub.upgradeButton')}
                </button>
            </div>
        );
    }
    
    if (!squad) {
        return (
            <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">{t('squadHub.noSquadTitle')}</h2>
                <p className="text-brand-text-muted mb-6">{t('squadHub.noSquadMessage')}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={onOpenSquadBuilder} className="flex-1 bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center justify-center gap-2">
                        <Icon name="plus" className="w-5 h-5"/> {t('squadHub.createButton')}
                    </button>
                    <button className="flex-1 bg-brand-secondary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300">
                        {t('squadHub.joinButton')}
                    </button>
                </div>
                {suggestedSquads.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">{t('squadHub.suggestionsTitle')}</h3>
                        <div className="space-y-2">
                            {suggestedSquads.map(s => <SquadCard key={s.id} squad={s} onRequest={() => onOpenRequestModal(s)} />)}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    const handleProposeName = () => {
        if (proposedName.trim() && squad) {
            onProposeSquadNameChange(squad.id, proposedName.trim());
            setProposedName('');
            setIsProposingName(false);
        }
    };

    const renderHeaderContent = () => {
        if (squad.nameChangeVote) {
            const vote = squad.nameChangeVote;
            const votesCount = Object.keys(vote.votes).length;
            const requiredVotes = Math.floor(squad.members.length / 2) + 1;
            const progress = (votesCount / requiredVotes) * 100;
            const hasVoted = vote.votes[user.id];

            return (
                <div className="bg-brand-bg p-4 rounded-lg border border-brand-primary/50 w-full">
                    <h3 className="font-bold text-lg text-brand-primary">{t('squadHub.nameChangeVote.title')}</h3>
                    <p className="text-sm text-brand-text-muted mb-2">
                        {t('squadHub.nameChangeVote.proposedBy', { name: vote.proposerName })}: <span className="font-bold text-brand-text">"{vote.proposedName}"</span>
                    </p>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-semibold text-brand-text-muted">{t('squadHub.nameChangeVote.votes', { count: votesCount, required: requiredVotes })}</span>
                    </div>
                    <div className="w-full bg-brand-surface rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    {!hasVoted && (
                        <button onClick={() => onVoteForSquadNameChange(squad.id)} className="w-full mt-3 bg-brand-primary text-white font-bold py-2 px-4 rounded-full text-sm">
                            {t('squadHub.nameChangeVote.voteButton')}
                        </button>
                    )}
                </div>
            );
        }
        
        if (isProposingName) {
            return (
                <div className="flex-grow">
                    <input 
                        type="text"
                        value={proposedName}
                        onChange={(e) => setProposedName(e.target.value)}
                        placeholder="Enter new squad name..."
                        className="w-full bg-brand-bg border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setIsProposingName(false)} className="text-sm text-brand-text-muted hover:underline">{t('squadHub.nameChangeVote.cancel')}</button>
                        <button onClick={handleProposeName} className="text-sm font-bold text-brand-primary hover:underline">{t('squadHub.nameChangeVote.propose')}</button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{squad.name}</h2>
                <button onClick={() => setIsProposingName(true)} className="text-brand-text-muted hover:text-white">
                    <Icon name="pencil" className="w-5 h-5"/>
                </button>
            </div>
        );
    };

    return (
        <>
            <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                        {renderHeaderContent()}
                        {!isProposingName && !squad.nameChangeVote && <p className="text-brand-text-muted mt-1">Goal: {squad.goalIdentity}</p>}
                    </div>
                    <button onClick={onOpenInviteModal} className="bg-brand-primary/20 text-brand-primary font-bold py-2 px-4 rounded-full text-sm hover:bg-brand-primary/40 flex items-center gap-2 ml-4 flex-shrink-0">
                        <Icon name="user-plus" className="w-4 h-4" /> {t('squadHub.inviteButton')}
                    </button>
                </div>
                
                <div className="flex border-b border-brand-secondary mb-4">
                    {['ripples', 'chat', 'saga', 'quests'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-2 px-4 font-semibold text-sm capitalize ${activeTab === tab ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}
                        >
                            {t(`squadHub.tabs.${tab}`)}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === 'ripples' && (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {ripples.map(ripple => {
                                if (ripple.type === 'assist_request') {
                                    return <AssistRequestRipple key={ripple.id} ripple={ripple} onOfferAssist={() => setAssistRequestToHelp(ripple)} />;
                                }
                                // Add other ripple types here later if needed
                                return (
                                    <div key={ripple.id} className="text-sm text-brand-text-muted">
                                        <span className="font-semibold text-brand-text">{ripple.authorName}</span> {ripple.message}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {activeTab === 'chat' && <ChatInterface user={user} messages={chatMessages.filter(m => m.squadId === squad.id)} onSendMessage={(text) => onSendChatMessage(squad.id, text)} />}
                    {activeTab === 'saga' && squad.saga && <SquadSagaWidget saga={squad.saga} user={user} onContribute={() => onContributeMomentumToSaga(squad.id)} />}
                    {activeTab === 'quests' && (
                        <div className="space-y-3">
                            {squad.quests.map(q => <SquadQuestCard key={q.id} quest={q} onComplete={() => onCompleteQuest(squad.id, q.id)} />)}
                        </div>
                    )}
                </div>
            </div>

            {assistRequestToHelp && priorityHabit && (
                <OfferAssistModal
                    requesterName={assistRequestToHelp.authorName}
                    requesterIdentity={squad.goalIdentity}
                    habitTitle={priorityHabit.title}
                    onClose={() => setAssistRequestToHelp(null)}
                    onSendAssist={(message) => {
                        onNudge(assistRequestToHelp.id, message);
                        setAssistRequestToHelp(null);
                    }}
                />
            )}
        </>
    );
};