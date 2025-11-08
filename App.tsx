import React, { useState, useCallback, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { HabitBuilder } from './components/HabitBuilder';
import { WeeklyReview } from './components/WeeklyReview';
import { AppState, User, Habit } from './types';

// Helper to check if a date was yesterday
const isYesterday = (date1: Date, date2: Date): boolean => {
    const prevDay = new Date(date1);
    prevDay.setDate(date1.getDate() - 1);
    return prevDay.getFullYear() === date2.getFullYear() &&
           prevDay.getMonth() === date2.getMonth() &&
           prevDay.getDate() === date2.getDate();
}

const App: React.FC = () => {
    // Attempt to load state from localStorage, or use initial state
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('momentumUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [habits, setHabits] = useState<Habit[]>(() => {
        const savedHabits = localStorage.getItem('momentumHabits');
        return savedHabits ? JSON.parse(savedHabits) : [];
    });
    const [appState, setAppState] = useState<AppState>('ONBOARDING');

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        if (user) localStorage.setItem('momentumUser', JSON.stringify(user));
        localStorage.setItem('momentumHabits', JSON.stringify(habits));
    }, [user, habits]);

    // Determine initial app state on load
    useEffect(() => {
        if (user?.onboardingCompleted) {
            setAppState('DASHBOARD');
        } else {
            setAppState('ONBOARDING');
        }
    }, [user]);

    const handleOnboardingComplete = useCallback((completedUser: User) => {
        setUser(completedUser);
        setAppState('DASHBOARD');
    }, []);

    const handleAddHabit = useCallback((newHabitData: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions'>) => {
        const newHabit: Habit = {
            ...newHabitData,
            id: Date.now().toString(),
            streak: 0,
            longestStreak: 0,
            lastCompleted: null,
            completions: [],
        };
        setHabits(prevHabits => [...prevHabits, newHabit]);
        setAppState('DASHBOARD');
    }, []);

    const handleCompleteHabit = useCallback((habitId: string) => {
        setHabits(prevHabits => 
            prevHabits.map(habit => {
                if (habit.id === habitId) {
                    const now = new Date();
                    const today = now.toISOString().split('T')[0];
                    const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted) : null;

                    if (habit.lastCompleted && new Date(habit.lastCompleted).toISOString().split('T')[0] === today) {
                        return habit; // Already completed today
                    }

                    let newStreak = habit.streak;
                    if (lastCompletedDate && isYesterday(now, lastCompletedDate)) {
                        newStreak += 1; // It was completed yesterday, increment streak
                    } else {
                        newStreak = 1; // Streak broken or first time
                    }
                    
                    const newLongestStreak = Math.max(habit.longestStreak, newStreak);

                    return {
                        ...habit,
                        streak: newStreak,
                        longestStreak: newLongestStreak,
                        lastCompleted: now.toISOString(),
                        completions: [...habit.completions, now.toISOString()],
                    };
                }
                return habit;
            })
        );
    }, []);
    
    const handleRemoveHabit = useCallback((habitId: string) => {
        const habitToRemove = habits.find(h => h.id === habitId);
        if (!habitToRemove) return;

        const confirmationMessage = `Are you sure you want to remove the habit "${habitToRemove.title}"? This action cannot be undone and your streak of ${habitToRemove.streak} will be lost.`;

        if (window.confirm(confirmationMessage)) {
            setHabits(prevHabits => prevHabits.filter(habit => habit.id !== habitId));
        }
    }, [habits]);

    const renderContent = () => {
        switch (appState) {
            case 'ONBOARDING':
                return <Onboarding onComplete={handleOnboardingComplete} />;
            case 'DASHBOARD':
                if (!user) return <Onboarding onComplete={handleOnboardingComplete} />; // Failsafe
                return <Dashboard 
                            user={user} 
                            habits={habits}
                            onCompleteHabit={handleCompleteHabit}
                            onRemoveHabit={handleRemoveHabit}
                            onAddNewHabit={() => setAppState('HABIT_BUILDER')}
                            onStartWeeklyReview={() => setAppState('WEEKLY_REVIEW')}
                       />;
            case 'HABIT_BUILDER':
                 if (!user) return <Onboarding onComplete={handleOnboardingComplete} />;
                 return <HabitBuilder 
                            user={user}
                            onAddHabit={handleAddHabit}
                            onClose={() => setAppState('DASHBOARD')}
                        />;
            case 'WEEKLY_REVIEW':
                return <WeeklyReview habits={habits} onClose={() => setAppState('DASHBOARD')} />
            default:
                return <div>Loading...</div>;
        }
    };

    return <div className="App">{renderContent()}</div>;
};

export default App;