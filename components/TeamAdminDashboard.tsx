import React, { useState, useMemo, useContext } from 'react';
import { Team, TeamChallenge } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface TeamAdminDashboardProps {
  team: Team;
  challenges: TeamChallenge[];
  onCreateChallenge: (challenge: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-brand-bg p-4 rounded-lg">
        <div className="flex items-center gap-3">
            <Icon name={icon} className="w-6 h-6 text-brand-primary" />
            <div>
                <p className="text-2xl font-bold text-brand-text">{value}</p>
                <p className="text-sm text-brand-text-muted">{title}</p>
            </div>
        </div>
    </div>
);

const CreateChallengeForm: React.FC<{ teamId: string; onCreate: (challenge: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => void; }> = ({ teamId, onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [habitCategory, setHabitCategory] = useState('');
    const [targetCompletions, setTargetCompletions] = useState(100);
    const { t } = useContext(LanguageContext)!;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && habitCategory && targetCompletions > 0) {
            onCreate({ teamId, title, description, habitCategory, targetCompletions });
            // Reset form
            setTitle('');
            setDescription('');
            setHabitCategory('');
            setTargetCompletions(100);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-brand-bg p-4 rounded-lg space-y-4">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('adminDashboard.challengeForm.titlePlaceholder')} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2" required />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('adminDashboard.challengeForm.descriptionPlaceholder')} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2 h-20"></textarea>
            <input type="text" value={habitCategory} onChange={e => setHabitCategory(e.target.value)} placeholder={t('adminDashboard.challengeForm.habitCategoryPlaceholder')} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2" required />
            <input type="number" value={targetCompletions} onChange={e => setTargetCompletions(parseInt(e.target.value, 10))} placeholder={t('adminDashboard.challengeForm.target')} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2" min="1" required />
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80">{t('adminDashboard.challengeForm.createButton')}</button>
        </form>
    );
};

export const TeamAdminDashboard: React.FC<TeamAdminDashboardProps> = ({ team, challenges, onCreateChallenge }) => {
    const { t } = useContext(LanguageContext)!;
    // In a real app, this data would be calculated from backend analytics.
    const activeMembers = useMemo(() => Math.floor(team.members.length * 0.8), [team.members.length]);
    const completionRate = 78;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h3 className="text-xl font-bold mb-4">{t('adminDashboard.statsTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title={t('adminDashboard.totalMembers')} value={team.members.length} icon="users" />
                    <StatCard title={t('adminDashboard.activeMembers')} value={activeMembers} icon="fire" />
                    <StatCard title={t('adminDashboard.completionRate')} value={`${completionRate}%`} icon="check" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4">{t('adminDashboard.membersTitle')}</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto bg-brand-surface p-2 rounded-lg">
                        {team.members.map(member => (
                            <div key={member.userId} className="bg-brand-bg p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-xs text-brand-text-muted">{member.email}</p>
                                </div>
                                <button className="text-sm text-brand-danger font-semibold hover:underline">{t('adminDashboard.remove')}</button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 bg-brand-primary/20 text-brand-primary font-bold py-2 px-4 rounded-full hover:bg-brand-primary/40">{t('adminDashboard.inviteMember')}</button>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">{t('adminDashboard.challengesTitle')}</h3>
                     <div className="space-y-4">
                        <CreateChallengeForm teamId={team.id} onCreate={onCreateChallenge} />
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {challenges.map(c => (
                                <div key={c.id} className="bg-brand-bg p-3 rounded-md">
                                    <p className="font-semibold">{c.title}</p>
                                    <p className="text-xs text-brand-text-muted">{c.currentCompletions} / {c.targetCompletions} completions</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
