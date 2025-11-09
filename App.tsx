import React, { useState, useEffect } from 'react';
import { User, Habit } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { setTheme } = useTheme();

    useEffect(() => {
        // Simulate loading from localStorage
        try {
            const savedUser = localStorage.getItem('momentum_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser) as User;
                setUser(parsedUser);
                setTheme(parsedUser.theme || 'dark');

                const savedHabits = localStorage.getItem('momentum_habits');
                if (savedHabits) {
                    setHabits(JSON.parse(savedHabits));
                }
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            // Clear corrupted data
            localStorage.removeItem('momentum_user');
            localStorage.removeItem('momentum_habits');
        } finally {
            setIsLoading(false);
        }
    }, [setTheme]);

    const handleOnboardingComplete = (newUser: Omit<User, 'id' | 'subscription'>, initialHabits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays' | 'isFavorite'>[]) => {
        const fullUser: User = {
            ...newUser,
            id: `user-${Date.now()}`,
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
        localStorage.setItem('momentum_user', JSON.stringify(fullUser));
        localStorage.setItem('momentum_habits', JSON.stringify(fullHabits));
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('momentum_user', JSON.stringify(updatedUser));
    };
    
    const handleUpdateHabits = (updatedHabits: Habit[]) => {
        setHabits(updatedHabits);
        localStorage.setItem('momentum_habits', JSON.stringify(updatedHabits));
    }

    if (isLoading) {
        return <div className="bg-brand-bg min-h-screen"></div>; // Or a loading spinner
    }

    if (!user) {
        return <Onboarding onOnboardingComplete={handleOnboardingComplete} />;
    }

    return <Dashboard user={user} habits={habits} onUpdateHabits={handleUpdateHabits} onUpdateUser={handleUpdateUser} />;
};

export default App;
