import React, { useState, useContext } from 'react';
import { User, Squad, SquadQuest, SquadSaga, ChatMessage } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';
import { SquadQuestCard } from './SquadQuestCard';
import { ChatInterface } from './ChatInterface';
import { SquadSagaWidget } from './SquadSagaWidget';

interface SquadHubProps {
  user: User;
  squad: Squad;
  quests: SquadQuest[];
  saga: SquadSaga;
  chatMessages: ChatMessage[];
  onCompleteQuest: (questId: string) => void;
  onContributeToSaga: () => void;
  onSendMessage: (text: string) => void;
}

type SquadTab = 'quests' | 'saga' | 'chat' | 'members';

export const SquadHub: React.FC<SquadHubProps> = ({ user, squad, quests, saga, chatMessages, onCompleteQuest, onContributeToSaga, onSendMessage }) => {
  const { t } = useContext(LanguageContext)!;
  const [activeTab, setActiveTab] = useState<SquadTab>('quests');

  const sortedMembers = [...squad.members].sort((a, b) => b.totalCompletions - a.totalCompletions);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'quests':
        return (
          <div className="space-y-3 animate-fade-in">
            {quests.map(quest => (
              <SquadQuestCard key={quest.id} quest={quest} onComplete={() => onCompleteQuest(quest.id)} />
            ))}
          </div>
        );
      case 'saga':
        return <SquadSagaWidget saga={saga} user={user} onContribute={onContributeToSaga} />;
      case 'chat':
        return <ChatInterface user={user} messages={chatMessages} onSendMessage={onSendMessage} />;
      case 'members':
        return (
             <div className="space-y-2 bg-brand-bg p-3 rounded-lg max-h-96 overflow-y-auto animate-fade-in">
                {sortedMembers.map((member, index) => (
                    <div key={member.userId} className={`flex items-center p-2 rounded ${member.userId === user.id ? 'bg-brand-primary/10' : ''}`}>
                    <div className="w-8 text-center font-bold text-brand-text-muted">{index + 1}</div>
                    <div className="flex-grow font-semibold text-brand-text">{member.name}</div>
                    <div className="w-20 text-right font-bold text-brand-text">{member.totalCompletions}</div>
                    </div>
                ))}
            </div>
        );
    }
  }

  const TabButton: React.FC<{ tab: SquadTab, icon: string, label: string }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 p-3 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:bg-brand-secondary/50'}`}
    >
      <Icon name={icon} className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
      <div className="md:flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 md:mb-0">
          <Icon name="users" className="w-6 h-6 text-brand-primary" />
          {squad.name}
        </h2>
        <div className="flex items-center gap-2 text-sm">
            <Icon name="fire" className="w-5 h-5 text-brand-warning"/>
            <span className="font-bold">{squad.sharedMomentum.toLocaleString()}</span>
            <span className="text-brand-text-muted">{t('squadHub.sharedMomentum')}</span>
        </div>
      </div>

      <div className="flex gap-2 bg-brand-bg p-1 rounded-lg mb-6">
        <TabButton tab="quests" icon="trophy" label={t('squadHub.tabs.quests')} />
        <TabButton tab="saga" icon="book-open" label={t('squadHub.tabs.saga')} />
        <TabButton tab="chat" icon="microphone" label={t('squadHub.tabs.chat')} />
        <TabButton tab="members" icon="user-plus" label={t('squadHub.tabs.members')} />
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};
