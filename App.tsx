import React, { useState, useEffect } from 'react';
import { User, Habit, TeamChallenge, UserIdentity, Team, Financials } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import { useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('momentum_all_users');
        if (saved) return JSON.parse(saved);
        return [
             { id: 'user-1', name: 'Alice', email: 'alice@momentum.io', subscription: { plan: 'pro', status: 'active' }, selectedIdentities: [{id: 'creator', name: 'The Creator', level: 5, xp: 50, description: 'Brings ideas to life', image: ''} as UserIdentity], language: 'en', theme: 'dark', voicePreference: 'Aura', role: 'user'},
             { id: 'user-2', name: 'Bob', email: 'bob@momentum.io', subscription: { plan: 'free', status: 'active' }, selectedIdentities: [{id: 'achiever', name: 'The Achiever', level: 2, xp: 80, description: 'Hits goals', image: ''} as UserIdentity], language: 'en', theme: 'dark', voicePreference: 'Orion', role: 'user' },
             { id: 'user-3', name: 'Charlie', email: 'charlie@momentum.io', subscription: { plan: 'team', status: 'active' }, teamId: 'team-1', selectedIdentities: [{id: 'leader', name: 'The Leader', level: 8, xp: 120, description: 'Inspires others', image: ''} as UserIdentity], language: 'en', theme: 'dark', voicePreference: 'Zephyr', role: 'user' },
        ];
    });
    const [teams, setTeams] = useState<Team[]>(() => {
        return [
            { id: 'team-1', name: 'Momentum Core', members: [{ userId: 'user-3', name: 'Charlie', totalCompletions: 150 }], subscriptionStatus: 'active' }
        ];
    });
    const [financials, setFinancials] = useState<Financials>({
        revenuePerProUser: 9,
        revenuePerTeamMember: 8,
        monthlyCosts: 15,
    });
    const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>(() => {
        const saved = localStorage.getItem('momentum_challenges');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'challenge-1', title: 'Q3 Creator Push', description: 'Log 100 total "Creator" habits as a team.', targetCompletions: 100, currentCompletions: 42, isActive: true }
        ];
    });
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'login' | 'onboarding' | 'dashboard'>('login');
    const [onboardingEmail, setOnboardingEmail] = useState<string>('');
    const { setTheme } = useTheme();

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('momentum_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser) as User;
                setUser(parsedUser);
                setTheme(parsedUser.theme || 'dark');
                setView('dashboard');

                const savedHabits = localStorage.getItem('momentum_habits');
                if (savedHabits) {
                    setHabits(JSON.parse(savedHabits));
                }
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            localStorage.clear();
        } finally {
            setIsLoading(false);
        }
    }, [setTheme]);

    const handleStartOnboarding = (email: string) => {
        setOnboardingEmail(email);
        setView('onboarding');
    };

    const handleFounderLogin = () => {
        const founderUser: User = {
            id: 'founder-001',
            name: 'Leonidas',
            email: 'leonidas.esquire@gmail.com',
            role: 'founder',
            selectedIdentities: [],
            subscription: { plan: 'team', status: 'active' },
            language: 'en',
            theme: 'dark',
            voicePreference: 'Orion'
        };
        setUser(founderUser);
        localStorage.setItem('momentum_user', JSON.stringify(founderUser));
        setView('dashboard');
    };

    const handleOnboardingComplete = (newUser: Omit<User, 'id' | 'subscription' | 'email'>, initialHabits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays' | 'isFavorite'>[]) => {
        const fullUser: User = {
            ...newUser,
            id: `user-${Date.now()}`,
            email: onboardingEmail,
            role: 'user',
            subscription: { plan: 'free', status: 'active' },
            selectedIdentities: newUser.selectedIdentities.map(identity => ({
                ...identity,
                level: 1,
                xp: 0
            }))
        };
        const fullHabits: Habit[] = initialHabits.map((h, i) => ({
            ...h,
            id: `habit-${Date.now()}-${i}`,
            streak: 0,
            longestStreak: 0,
            lastCompleted: null,
            completions: [],
            momentumShields: 1,
            missedDays: 0,
            isFavorite: false,
        }));
        setUser(fullUser);
        setHabits(fullHabits);
        
        const updatedAllUsers = [...allUsers, fullUser];
        setAllUsers(updatedAllUsers);

        localStorage.setItem('momentum_user', JSON.stringify(fullUser));
        localStorage.setItem('momentum_habits', JSON.stringify(fullHabits));
        localStorage.setItem('momentum_all_users', JSON.stringify(updatedAllUsers));
        setView('dashboard');
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('momentum_user', JSON.stringify(updatedUser));
    };
    
    const handleUpdateHabits = (updatedHabits: Habit[]) => {
        setHabits(updatedHabits);
        localStorage.setItem('momentum_habits', JSON.stringify(updatedHabits));
    }

    const handleUpdateUsers = (updatedUsers: User[]) => {
        setAllUsers(updatedUsers);
        localStorage.setItem('momentum_all_users', JSON.stringify(updatedUsers));
    };

    const handleCreateChallenge = (challengeData: Omit<TeamChallenge, 'id' | 'currentCompletions' | 'isActive'>) => {
        const newChallenge: TeamChallenge = {
            ...challengeData,
            id: `challenge-${Date.now()}`,
            currentCompletions: 0,
            isActive: true
        };
        const updatedChallenges = [newChallenge, ...teamChallenges].map(c => ({...c, isActive: c.id === newChallenge.id}));
        setTeamChallenges(updatedChallenges);
        localStorage.setItem('momentum_challenges', JSON.stringify(updatedChallenges));
    };

    const handleLogout = () => {
        setUser(null);
        setHabits([]);
        localStorage.removeItem('momentum_user');
        localStorage.removeItem('momentum_habits');
        setView('login');
    };

    if (isLoading) {
        return <div className="bg-brand-bg min-h-screen"></div>;
    }

    if (view === 'login') {
        return <LoginScreen onStartOnboarding={handleStartOnboarding} onFounderLogin={handleFounderLogin} />;
    }
    
    if (view === 'onboarding') {
        return <Onboarding initialEmail={onboardingEmail} onOnboardingComplete={handleOnboardingComplete} />;
    }

    if (view === 'dashboard' && user) {
        return (
            <Dashboard 
                user={user} 
                habits={habits}
                allUsers={allUsers}
                teams={teams}
                financials={financials}
                teamChallenges={teamChallenges}
                onUpdateHabits={handleUpdateHabits}
                onUpdateUser={handleUpdateUser}
                onUpdateUsers={handleUpdateUsers}
                onCreateChallenge={handleCreateChallenge}
                onLogout={handleLogout} 
            />
        );
    }
    
    return <LoginScreen onStartOnboarding={handleStartOnboarding} onFounderLogin={handleFounderLogin} />;
};

export default App;