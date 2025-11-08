import React from 'react';
import { Habit } from '../types';
import { Icon } from './Icon';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  isCompletedToday: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onDelete, isCompletedToday }) => {
  const { title, identityTag, cue, streak } = habit;

  return (
    <div className={`bg-brand-surface border border-brand-secondary rounded-xl p-4 md:p-6 flex items-center justify-between transition-all duration-300 ${isCompletedToday ? 'opacity-50' : ''}`}>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2 py-1 rounded-full">{identityTag}</span>
          <span className="text-xs text-brand-text-muted">{cue}</span>
        </div>
        <p className="text-lg font-semibold text-brand-text">{title}</p>
        <div className="flex items-center gap-1 mt-2 text-brand-accent">
          <Icon name="fire" className="w-5 h-5" />
          <span className="font-bold text-lg">{streak}</span>
          <span className="text-sm text-brand-text-muted"> day streak</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          onClick={() => onDelete(habit.id)}
          className="text-brand-text-muted hover:text-brand-danger p-2 rounded-full hover:bg-brand-danger/10 transition-colors duration-200"
          aria-label={`Delete habit: ${title}`}
        >
          <Icon name="trash" className="w-5 h-5" />
        </button>
        <button
          onClick={() => onComplete(habit.id)}
          disabled={isCompletedToday}
          className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 transform
            ${isCompletedToday 
              ? 'bg-green-500 text-white scale-100' 
              : 'bg-brand-bg border-2 border-brand-secondary text-brand-text-muted hover:bg-brand-primary hover:border-brand-primary hover:text-white hover:scale-110'}`}
          aria-label={`Complete habit: ${title}`}
        >
          <Icon name="check" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};