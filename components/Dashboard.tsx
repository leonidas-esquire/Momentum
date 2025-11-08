import React, { useState } from 'react';
import { User, Habit } from '../types';
import { HabitCard } from './HabitCard';
import { HabitBuilder } from './HabitBuilder';
import { WeeklyReview } from './WeeklyReview';
import { DeleteConfirmation } from './DeleteConfirmation';
import { Icon } from './Icon';

interface DashboardProps {
  user: User;
  habits: Habit[];
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions'>) => void;
  onCompleteHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateUser: (user: User) => void;
}

const isToday = (someDate: string | null) => {
    if (!someDate) return false;
    const today = new Date();
    const date = new Date(someDate);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export const Dashboard: React.FC<DashboardProps> = ({ user, habits, onAddHabit, onCompleteHabit, onDeleteHabit, onUpdateUser }) => {
  const [showHabitBuilder, setShowHabitBuilder] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  
  const firstName = user.name.split(' ')[0];

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editedName.trim()) {
      onUpdateUser({ ...user, name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditedName(user.name);
    setIsEditingName(false);
  };

  const handleInitiateDelete = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setHabitToDelete(habit);
    }
  };

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      onDeleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setHabitToDelete(null);
  };

  const morningHabits = habits.filter(h => h.cue === 'In the morning');
  const afternoonHabits = habits.filter(h => h.cue === 'During my lunch break' || h.cue === 'After my workout');
  const eveningHabits = habits.filter(h => h.cue === 'Before bed');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
           {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-brand-surface border border-brand-secondary rounded-lg px-2 py-1 text-3xl md:text-4xl font-bold w-full"
                autoFocus
              />
              <button type="submit" className="p-2 bg-brand-safe rounded-full text-white hover:bg-opacity-80 flex-shrink-0"><Icon name="check" className="w-5 h-5"/></button>
              <button type="button" onClick={handleCancelEditName} className="p-2 bg-brand-danger rounded-full text-white hover:bg-opacity-80 flex-shrink-0"><Icon name="close" className="w-5 h-5"/></button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold">Hello, {firstName}</h1>
              <button onClick={() => { setIsEditingName(true); setEditedName(user.name); }} className="text-brand-text-muted hover:text-white p-1 rounded-full hover:bg-brand-surface">
                  <Icon name="pencil" className="w-5 h-5"/>
              </button>
            </div>
          )}
          <p className="text-brand-text-muted">Ready to build momentum?</p>
        </div>
        <button 
          onClick={() => setShowWeeklyReview(true)}
          className="bg-brand-surface border border-brand-secondary text-brand-text font-semibold py-2 px-4 rounded-full text-sm hover:bg-brand-secondary transition-colors duration-300 flex-shrink-0 ml-4"
        >
          Weekly Review
        </button>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <div className="space-y-8">
            {habits.length === 0 ? (
                <div className="text-center bg-brand-surface border border-brand-secondary rounded-xl p-8">
                    <h2 className="text-xl font-semibold mb-2">Your journey starts here.</h2>
                    <p className="text-brand-text-muted mb-6">Create your first routine to start building your new identity.</p>
                    <button onClick={() => setShowHabitBuilder(true)} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                        <Icon name="plus" className="w-5 h-5"/> Create Routine
                    </button>
                </div>
            ) : (
                <>
                    {morningHabits.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Morning</h2>
                            <div className="space-y-4">
                                {morningHabits.map(habit => (
                                    <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onDelete={handleInitiateDelete} isCompletedToday={isToday(habit.lastCompleted)} />
                                ))}
                            </div>
                        </div>
                    )}
                    {afternoonHabits.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Afternoon</h2>
                            <div className="space-y-4">
                                {afternoonHabits.map(habit => (
                                    <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onDelete={handleInitiateDelete} isCompletedToday={isToday(habit.lastCompleted)} />
                                ))}
                            </div>
                        </div>
                    )}
                    {eveningHabits.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Evening</h2>
                            <div className="space-y-4">
                                {eveningHabits.map(habit => (
                                    <HabitCard key={habit.id} habit={habit} onComplete={onCompleteHabit} onDelete={handleInitiateDelete} isCompletedToday={isToday(habit.lastCompleted)} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="fixed bottom-8 right-8">
                        <button onClick={() => setShowHabitBuilder(true)} className="bg-brand-primary text-white rounded-full p-4 shadow-lg hover:bg-opacity-80 transition-transform duration-200 hover:scale-110">
                            <Icon name="plus" className="w-8 h-8" />
                        </button>
                    </div>
                </>
            )}
        </div>
      </main>

      {showHabitBuilder && <HabitBuilder user={user} onAddHabit={onAddHabit} onClose={() => setShowHabitBuilder(false)} />}
      {showWeeklyReview && <WeeklyReview habits={habits} onClose={() => setShowWeeklyReview(false)} />}
      {habitToDelete && <DeleteConfirmation habitTitle={habitToDelete.title} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </div>
  );
};