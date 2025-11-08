import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { User, Habit } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage
    try {
      const storedUser = localStorage.getItem('momentum_user');
      const storedHabits = localStorage.getItem('momentum_habits');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save to localStorage
    if (isLoaded) {
      try {
        if (user) {
          localStorage.setItem('momentum_user', JSON.stringify(user));
        }
        localStorage.setItem('momentum_habits', JSON.stringify(habits));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [user, habits, isLoaded]);

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions'>) => {
    const habitToAdd: Habit = {
      ...newHabit,
      id: new Date().toISOString() + Math.random(),
      streak: 0,
      longestStreak: 0,
      lastCompleted: null,
      completions: [],
    };
    setHabits(prev => [...prev, habitToAdd]);
  };
  
  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
  };

  const handleCompleteHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const today = new Date();
        const todayStr = today.toISOString();
        const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
        
        // If already completed today, do nothing.
        if (lastCompletedDate && isSameDay(today, lastCompletedDate)) {
            return habit;
        }

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let newStreak = habit.streak;

        if (lastCompletedDate && isSameDay(yesterday, lastCompletedDate)) {
            newStreak += 1; // It was completed yesterday, so increment streak
        } else {
            newStreak = 1; // Reset streak
        }
        
        const newLongestStreak = Math.max(habit.longestStreak, newStreak);

        return {
          ...habit,
          streak: newStreak,
          longestStreak: newLongestStreak,
          lastCompleted: todayStr,
          completions: [...habit.completions, todayStr],
        };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><p>Loading...</p></div>;
  }
  
  if (user && user.onboardingCompleted) {
    return <Dashboard user={user} habits={habits} onAddHabit={handleAddHabit} onCompleteHabit={handleCompleteHabit} onDeleteHabit={handleDeleteHabit} onUpdateUser={handleUpdateUser} />;
  }
  
  return <Onboarding onComplete={handleOnboardingComplete} />;
};

export default App;