import React, { useState, useMemo, useContext } from 'react';
import { User, TeamChallenge, Financials, Team } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';
import { FinancialsWidget } from './FinancialsWidget';

interface AdminDashboardProps {
    allUsers: User[];
    teams: Team[];
    financials: Financials;
    teamChallenges: TeamChallenge[];
    onUpdateUsers: (users: User[]) => void;
    onCreateChallenge: (challenge: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => void;
    onLogout: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-brand-surface p-6 rounded-xl border border-brand-secondary flex items-center gap-4">
        <div className="bg-brand-primary/10 p-3 rounded-full">
            <Icon name={icon} className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-brand-text-muted">{title}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, teams, financials, teamChallenges, onUpdateUsers, onCreateChallenge, onLogout }) => {
    const { t } = useContext(LanguageContext)!;
    const [newChallengeTitle, setNewChallengeTitle] = useState('');
    const [newChallengeDesc, setNewChallengeDesc] = useState('');
    const [newChallengeTarget, setNewChallengeTarget] = useState(100);

    const stats = useMemo(() => {
        const totalMembers = allUsers.length;
        // Correctly count active members based on subscription status, not just existence.
        const activeMembers = allUsers.filter(u => u.subscription.status === 'active').length;
        const completionRate = '78%'; // Placeholder for more complex calculation

        return { totalMembers, activeMembers, completionRate };
    }, [allUsers]);

    const handleRemoveUser = (userId: string) => {
        if (window.confirm('Are you sure you want to remove this user? This cannot be undone.')) {
            onUpdateUsers(allUsers.filter(u => u.id !== userId));
        }
    };

    const handleCreateChallengeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChallengeTitle.trim()) return;
        onCreateChallenge({
            title: newChallengeTitle,
            description: newChallengeDesc,
            targetCompletions: newChallengeTarget,
        });
        setNewChallengeTitle('');
        setNewChallengeDesc('');
        setNewChallengeTarget(100);
    };

    return (
        <div className="bg-brand-bg min-h-screen text-brand-text p-4 md:p-8">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Founder's Dashboard</h1>
                    <p className="text-brand-text-muted">Momentum Ecosystem Overview</p>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 bg-brand-surface border border-brand-secondary text-brand-text-muted font-bold py-2 px-4 rounded-full hover:border-brand-primary hover:text-brand-primary transition-colors">
                    <span>Logout</span>
                    <Icon name="arrow-uturn-left" className="w-5 h-5" />
                </button>
            </header>

            <main className="max-w-7xl mx-auto">
                <FinancialsWidget financials={financials} allUsers={allUsers} teams={teams} />

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">{t('adminDashboard.statsTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title={t('adminDashboard.totalMembers')} value={stats.totalMembers} icon="users" />
                        <StatCard title={t('adminDashboard.activeMembers')} value={stats.activeMembers} icon="star" />
                        <StatCard title={t('adminDashboard.completionRate')} value={stats.completionRate} icon="trending-up" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-brand-surface border border-brand-secondary rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">{t('adminDashboard.membersTitle')}</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                           {allUsers.map(user => (
                               <div key={user.id} className="flex items-center p-3 bg-brand-bg rounded-lg">
                                   <div className="flex-grow">
                                       <p className="font-semibold">{user.name}</p>
                                       <p className="text-sm text-brand-text-muted">{user.email}</p>
                                   </div>
                                   <p className={`text-sm font-bold uppercase px-2 py-1 rounded-full ${user.subscription.plan === 'pro' ? 'bg-yellow-400/20 text-yellow-500' : user.subscription.plan === 'team' ? 'bg-brand-safe/20 text-brand-safe' : 'bg-brand-secondary/20 text-brand-text-muted'}`}>
                                       {user.subscription.plan}
                                   </p>
                                   <button onClick={() => handleRemoveUser(user.id)} className="ml-4 p-2 text-brand-text-muted hover:text-brand-danger rounded-full hover:bg-brand-danger/10 transition-colors">
                                       <Icon name="trash" className="w-5 h-5"/>
                                   </button>
                               </div>
                           ))}
                        </div>
                         <button onClick={() => alert('Invite functionality coming soon!')} className="w-full mt-4 bg-brand-primary/10 text-brand-primary font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors">
                            {t('adminDashboard.inviteMember')}
                        </button>
                    </div>

                    <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">{t('adminDashboard.challengesTitle')}</h2>
                        <form onSubmit={handleCreateChallengeSubmit} className="space-y-4 p-4 bg-brand-bg rounded-lg mb-6">
                            <input type="text" value={newChallengeTitle} onChange={e => setNewChallengeTitle(e.target.value)} placeholder={t('adminDashboard.challengeForm.titlePlaceholder')} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2.5 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                            <textarea value={newChallengeDesc} onChange={e => setNewChallengeDesc(e.target.value)} placeholder={t('adminDashboard.challengeForm.descriptionPlaceholder')} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2.5 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none" rows={2}></textarea>
                             <div>
                                <label className="block text-sm font-medium text-brand-text-muted mb-1">{t('adminDashboard.challengeForm.target')}</label>
                                <input type="number" min="1" value={newChallengeTarget} onChange={e => setNewChallengeTarget(Number(e.target.value))} className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-2.5 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                            </div>
                            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2.5 px-4 rounded-full hover:bg-opacity-80 transition-colors">{t('adminDashboard.challengeForm.createButton')}</button>
                        </form>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {teamChallenges.map(challenge => (
                                <div key={challenge.id} className={`p-3 rounded-lg border-l-4 ${challenge.isActive ? 'border-brand-safe' : 'border-brand-secondary'}`}>
                                    <p className="font-semibold">{challenge.title}</p>
                                    <p className="text-sm text-brand-text-muted">{challenge.currentCompletions} / {challenge.targetCompletions}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;