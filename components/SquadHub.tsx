import React, { useState, useContext } from 'react';
import { User, Squad, Ripple, ChatMessage } from '../types';
import { Icon } from './Icon';
import { SquadQuestCard } from './SquadQuestCard';
import { ChatInterface } from './ChatInterface';
import { SquadSagaWidget } from './SquadSagaWidget';
import { findMatchingSquads } from '../services/squadService';
import { LanguageContext } from '../contexts/LanguageContext';

interface SquadHubProps {
  user: User;
  isProUser: boolean;
  squad: Squad | null;
  allSquads: Squad[];
  ripples: Ripple[];
  chatMessages: ChatMessage[];
  onOpenSquadBuilder: () => void;
  onOpenInviteModal: () => void;
  onOpenRequestModal: (squad: Squad) => void;
  onVoteOnRequest: (squadId: string, requestUserName: string, vote: 'approve' | 'deny') => void;
  onVoteToKick: (squadId: string, targetUserName: string) => void;
  onNudge: (rippleId: string, message: string) => void;
  onCompleteQuest: (squadId: string, questId: string) => void;
  onSendChatMessage: (squadId: string, text: string) => void;
  onTriggerUpgrade: (reason: string) => void;
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


export const SquadHub: React.FC<SquadHubProps> = (props) => {
    const { user, isProUser, squad, allSquads, ripples, chatMessages, onOpenSquadBuilder, onOpenInviteModal, onOpenRequestModal, onVoteOnRequest, onVoteToKick, onNudge, onCompleteQuest, onSendChatMessage, onTriggerUpgrade } = props;
    const { t } = useContext(LanguageContext)!;
    const [activeTab, setActiveTab] = useState<'chat' | 'saga' | 'quests'>('chat');
    
    const suggestedSquads = findMatchingSquads(user, allSquads);

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

    return (
        <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold">{squad.name}</h2>
                    <p className="text-brand-text-muted">Goal: {squad.goalIdentity}</p>
                </div>
                <button onClick={onOpenInviteModal} className="bg-brand-primary/20 text-brand-primary font-bold py-2 px-4 rounded-full text-sm hover:bg-brand-primary/40 flex items-center gap-2">
                    <Icon name="user-plus" className="w-4 h-4" /> {t('squadHub.inviteButton')}
                </button>
            </div>
            
            <div className="flex border-b border-brand-secondary mb-4">
                {['chat', 'saga', 'quests'].map(tab => (
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
                {activeTab === 'chat' && <ChatInterface user={user} messages={chatMessages.filter(m => m.squadId === squad.id)} onSendMessage={(text) => onSendChatMessage(squad.id, text)} />}
                {activeTab === 'saga' && squad.saga && <SquadSagaWidget saga={squad.saga} />}
                {activeTab === 'quests' && (
                    <div className="space-y-3">
                        {squad.quests.map(q => <SquadQuestCard key={q.id} quest={q} onComplete={() => onCompleteQuest(squad.id, q.id)} />)}
                    </div>
                )}
            </div>
        </div>
    );
};
