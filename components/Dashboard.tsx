import React, { useState, useMemo } from 'react';
import { User, Habit, TeamChallenge, Team, Financials } from '../types';
import { HabitCard } from './HabitCard';
import { HabitBuilder } from './HabitBuilder';
import { DeleteConfirmation } from './DeleteConfirmation';
import { WeeklyReview } from './WeeklyReview';
import { IdentityStatus } from './IdentityStatus';
import { SettingsModal } from './SettingsModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { Icon } from './Icon';
import AdminDashboard from './AdminDashboard';

interface DashboardProps {
  user: User;
  habits: Habit[];
  allUsers: User[];
  teams: Team[];
  financials: Financials;
  teamChallenges: TeamChallenge[];
  onUpdateHabits: (habits: Habit[]) => void;
  onUpdateUser: (user: User) => void;
  onUpdateUsers: (users: User[]) => void;
  onCreateChallenge: (challenge: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, habits, allUsers, teams, financials, teamChallenges, onUpdateHabits, onUpdateUser, onUpdateUsers, onCreateChallenge, onLogout }) => {
    const [showHabitBuilder, setShowHabitBuilder] = useState(false);
    const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
    const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
    const [showWeeklyReview, setShowWeeklyReview] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const sortedHabits = useMemo(() => {
        return [...habits].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }, [habits]);

    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays'> | Habit) => {
        if ('id' in habitData) {
            onUpdateHabits(habits.map(h => h.id === habitData.id ? { ...h, ...habitData } : h));
        } else {
            const newHabit: Habit = {
                ...habitData,
                id: `habit-${Date.now()}`,
                streak: 0,
                longestStreak: 0,
                lastCompleted: null,
                completions: [],
                isFavorite: false,
                momentumShields: 1,
                missedDays: 0,
            };
            onUpdateHabits([...habits, newHabit]);
        }
        setShowHabitBuilder(false);
        setHabitToEdit(null);
    };
    
    const handleComplete = (id: string) => {
        onUpdateHabits(habits.map(h => h.id === id ? { ...h, lastCompleted: new Date().toISOString() } : h));
    };
    
    const handleUndo = (id: string) => {
        onUpdateHabits(habits.map(h => h.id === id ? { ...h, lastCompleted: null } : h));
    };

    const handleDelete = (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (habit) setHabitToDelete(habit);
    };
    
    const confirmDelete = () => {
        if (habitToDelete) {
            onUpdateHabits(habits.filter(h => h.id !== habitToDelete.id));
            setHabitToDelete(null);
        }
    };
    
    const handleToggleFavorite = (id: string) => {
        onUpdateHabits(habits.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h));
    };
    
    const handleEdit = (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (habit) {
            setHabitToEdit(habit);
            setShowHabitBuilder(true);
        }
    };

    if (user.role === 'founder') {
        return (
            <AdminDashboard 
                allUsers={allUsers}
                teams={teams}
                financials={financials}
                teamChallenges={teamChallenges}
                onUpdateUsers={onUpdateUsers}
                onCreateChallenge={onCreateChallenge}
                onLogout={onLogout}
            />
        );
    }

    return (
        <div className="bg-brand-bg min-h-screen text-brand-text p-4 md:p-8">
            <header className="max-w-4xl mx-auto flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Hello, {user.name}</h1>
                    <p className="text-brand-text-muted">Let's build some momentum.</p>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-brand-surface">
                    <Icon name="cog" className="w-6 h-6" />
                </button>
            </header>
            
            <main className="max-w-4xl mx-auto">
                <IdentityStatus identities={user.selectedIdentities} />

                <div className="my-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Today's Habits</h2>
                        <button onClick={() => setShowWeeklyReview(true)} className="text-sm font-semibold text-brand-primary hover:underline">
                            Weekly Review
                        </button>
                    </div>
                    <div className="space-y-4">
                        {sortedHabits.map(habit => (
                            <HabitCard 
                                key={habit.id}
                                habit={habit}
                                onComplete={handleComplete}
                                onUndo={handleUndo}
                                onDelete={handleDelete}
                                onToggleFavorite={handleToggleFavorite}
                                onStartVoiceNote={() => {}}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                    <button onClick={() => { setHabitToEdit(null); setShowHabitBuilder(true); }} className="w-full mt-4 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg p-4 text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors">
                        + Add a New Habit
                    </button>
                </div>
            </main>

            {showHabitBuilder && (
                <HabitBuilder 
                    user={user}
                    habitToEdit={habitToEdit}
                    onSaveHabit={handleSaveHabit}
                    onClose={() => { setShowHabitBuilder(false); setHabitToEdit(null); }}
                />
            )}
            {habitToDelete && (
                <DeleteConfirmation 
                    habitTitle={habitToDelete.title}
                    onConfirm={confirmDelete}
                    onCancel={() => setHabitToDelete(null)}
                />
            )}
            {showWeeklyReview && (
                <WeeklyReview habits={habits} onClose={() => setShowWeeklyReview(false)} />
            )}
            {showSettings && (
                <SettingsModal 
                    user={user} 
                    onClose={() => setShowSettings(false)}
                    onUpdateUser={onUpdateUser}
                    onLogout={onLogout}
                    onDeleteAccount={onLogout}
                    onShowPrivacyPolicy={() => setShowPrivacy(true)}
                    onShowTermsOfService={() => setShowTerms(true)}
                    onShowPlaybook={() => {}}
                />
            )}
            {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
            {showTerms && <TermsOfServiceModal onClose={() => setShowTerms(false)} />}
        </div>
    );
};

export default Dashboard;