import React, { useState } from 'react';
import { Habit } from '../types';
import { Icon } from './Icon';
import { isToday } from '../utils/date';
import { triggerVibration, playCompletionSound } from '../utils/feedback';

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onUndo, onDelete }) => {
  const [isCompleted, setIsCompleted] = useState(isToday(habit.lastCompleted));

  const handleComplete = () => {
    onComplete(habit.id);
    setIsCompleted(true);
    triggerVibration();
    playCompletionSound();
  };
  
  const handleUndo = () => {
    onUndo(habit.id);
    setIsCompleted(false);
  };
  
  return (
    <div className={`bg-brand-surface border-l-4 rounded-r-lg p-4 flex items-center gap-4 transition-all duration-300 ${isCompleted ? 'border-brand-safe opacity-60' : 'border-brand-primary'}`}>
        <div className="flex-grow">
            <p className="font-bold text-lg text-brand-text">{habit.title}</p>
            {habit.description && <p className="text-sm text-brand-text-muted">{habit.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-brand-text-muted">
                <div className="flex items-center gap-1">
                    <Icon name="fire" className={`w-4 h-4 ${habit.streak > 0 ? 'text-brand-warning' : ''}`} />
                    <span>{habit.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-1">
                    <Icon name="shield" className={`w-4 h-4 ${habit.momentumShields > 0 ? 'text-brand-safe' : ''}`} />
                    <span>{habit.momentumShields} Shields</span>
                </div>
                {habit.missedDays > 0 && !isCompleted && (
                    <div className="flex items-center gap-1 text-brand-danger">
                        <Icon name="trending-down" className="w-4 h-4" />
                        <span>Missed {habit.missedDays} {habit.missedDays > 1 ? 'days' : 'day'}</span>
                    </div>
                )}
            </div>
        </div>
        <div className="flex-shrink-0">
            {isCompleted ? (
                <button
                    onClick={handleUndo}
                    className="w-16 h-16 bg-brand-safe/20 rounded-full flex flex-col items-center justify-center text-brand-safe hover:bg-brand-safe/30 transition-colors"
                >
                    <Icon name="check" className="w-8 h-8" />
                    <span className="text-xs font-bold">DONE</span>
                </button>
            ) : (
                <button
                    onClick={handleComplete}
                    className="w-16 h-16 bg-brand-secondary rounded-full flex items-center justify-center text-white hover:bg-brand-primary transition-colors"
                >
                    <Icon name="plus" className="w-8 h-8" />
                </button>
            )}
        </div>
    </div>
  );
};