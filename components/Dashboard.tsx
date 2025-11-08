import React from 'react';
import { Habit, User } from '../types';
import { HabitCard } from './HabitCard';
import { Icon } from './Icon';

interface DashboardProps {
  user: User;
  habits: Habit[];
  onCompleteHabit: (habitId: string) => void;
  onRemoveHabit: (habitId: string) => void;
  onAddNewHabit: () => void;
  onStartWeeklyReview: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, habits, onCompleteHabit, onRemoveHabit, onAddNewHabit, onStartWeeklyReview }) => {
  const priorityHabit = habits.length > 0 ? habits.reduce((p, c) => (p.streak > c.streak ? p : c)) : null;
  const otherHabits = habits.filter(h => h.id !== priorityHabit?.id);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-4 md:p-8 animate-fade-in">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Today's Momentum</h1>
          <p className="text-brand-text-muted">Hello, {user.name}</p>
        </div>
        <button onClick={onStartWeeklyReview} className="bg-brand-surface hover:bg-brand-secondary text-sm font-semibold py-2 px-4 rounded-full transition-colors duration-300 flex items-center gap-2">
            <Icon name="book-open" className="w-4 h-4" /> Weekly Review
        </button>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {habits.length === 0 ? (
          <div className="text-center bg-brand-surface p-8 rounded-2xl">
            <h2 className="text-xl font-semibold mb-2">Let's build your first habit.</h2>
            <p className="text-brand-text-muted mb-6">Create a new routine to start building momentum.</p>
            <button onClick={onAddNewHabit} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
              <Icon name="plus" className="w-5 h-5"/> Create Routine
            </button>
          </div>
        ) : (
          <>
            {priorityHabit && (
              <div>
                <h2 className="text-lg font-semibold text-brand-primary mb-2">Priority Routine</h2>
                <HabitCard habit={priorityHabit} onComplete={onCompleteHabit} onRemove={onRemoveHabit} isPriority />
              </div>
            )}
            {otherHabits.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-brand-text-muted mb-2">Other Routines</h2>
                <div className="space-y-4">
                  {otherHabits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onRemove={onRemoveHabit} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <div className="fixed bottom-8 right-8">
        <button onClick={onAddNewHabit} className="bg-brand-primary text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <Icon name="plus" className="w-8 h-8"/>
        </button>
      </div>
    </div>
  );
};