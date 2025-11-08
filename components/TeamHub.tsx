import React, { useContext } from 'react';
import { Team, TeamChallenge } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface TeamHubProps {
  team: Team;
  challenges: TeamChallenge[];
  currentUserId: string;
}

const TeamChallengeCard: React.FC<{ challenge: TeamChallenge }> = ({ challenge }) => {
    const progress = (challenge.currentCompletions / challenge.targetCompletions) * 100;
    return (
        <div className="bg-brand-bg p-4 rounded-lg border border-brand-secondary">
            <h3 className="text-lg font-bold text-brand-primary">{challenge.title}</h3>
            <p className="text-sm text-brand-text-muted mt-1">{challenge.description}</p>
            <div className="flex justify-between items-baseline mt-3">
                <span className="text-xs font-semibold text-brand-text-muted">PROGRESS</span>
                <span className="font-bold text-brand-text">{challenge.currentCompletions.toLocaleString()} / {challenge.targetCompletions.toLocaleString()}</span>
            </div>
            <div className="w-full bg-brand-bg rounded-full h-2.5 mt-1 border border-brand-secondary">
                <div 
                    className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export const TeamHub: React.FC<TeamHubProps> = ({ team, challenges, currentUserId }) => {
  const { t } = useContext(LanguageContext)!;
  const activeChallenge = challenges.find(c => c.isActive);
  const sortedMembers = [...team.members].sort((a, b) => b.totalCompletions - a.totalCompletions);

  return (
    <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
      <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
        <Icon name="shield" className="w-6 h-6 text-brand-safe" />
        {team.name} {t('teamHub.title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{t('teamHub.challengeTitle')}</h3>
          {activeChallenge ? (
            <TeamChallengeCard challenge={activeChallenge} />
          ) : (
            <div className="bg-brand-bg p-4 rounded-lg text-center text-brand-text-muted">
              No active challenges right now. Stay tuned!
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2">{t('teamHub.leaderboardTitle')}</h3>
          <div className="space-y-2 bg-brand-bg p-3 rounded-lg max-h-60 overflow-y-auto">
            <div className="flex items-center text-xs font-bold text-brand-text-muted px-2">
                <div className="w-8 text-center">{t('teamHub.rank')}</div>
                <div className="flex-grow">{t('teamHub.member')}</div>
                <div className="w-20 text-right">{t('teamHub.completions')}</div>
            </div>
            {sortedMembers.map((member, index) => {
              const isCurrentUser = member.userId === currentUserId;
              return (
                <div key={member.userId} className={`flex items-center p-2 rounded ${isCurrentUser ? 'bg-brand-primary/10' : ''}`}>
                  <div className="w-8 text-center font-bold text-brand-text-muted">{index + 1}</div>
                  <div className={`flex-grow font-semibold ${isCurrentUser ? 'text-brand-primary' : 'text-brand-text'}`}>{member.name}</div>
                  <div className="w-20 text-right font-bold text-brand-text">{member.totalCompletions}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
