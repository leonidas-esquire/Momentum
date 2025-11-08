import React from 'react';
import { Habit } from '../types';
import { Icon } from './Icon';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onSetPriority: (habitId: string) => void;
  isCompletedToday: boolean;
  isPriority: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onDelete, onSetPriority, isCompletedToday, isPriority }) => {
  const { title, description, identityTag, cue, streak, momentumShields, comebackChallenge, microVersion } = habit;

  if (comebackChallenge?.isActive) {
      return (
        <div className={`bg-brand-warning/10 border-2 border-dashed border-brand-warning rounded-xl p-4 md:p-6 flex items-center justify-between transition-all duration-300`}>
             <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                   <Icon name="arrow-uturn-left" className="w-5 h-5 text-brand-warning" />
                   <span className="text-brand-warning text-sm font-bold uppercase tracking-wider">Comeback Challenge</span>
                </div>
                <p className="text-lg font-semibold text-brand-text">{title}</p>
                <p className="text-sm text-brand-text-muted mt-1">
                    Complete this for <span className="font-bold text-white">{comebackChallenge.daysRemaining} more day(s)</span> to restore your {comebackChallenge.originalStreak}-day streak!
                </p>
             </div>
              <button
                onClick={() => onComplete(habit.id)}
                disabled={isCompletedToday}
                className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 transform
                    ${isCompletedToday 
                    ? 'bg-brand-safe text-white scale-100' 
                    : 'bg-brand-warning text-white hover:bg-opacity-80 hover:scale-110'}`}
                aria-label={`Complete habit for comeback: ${title}`}
                >
                <Icon name="check" className="w-8 h-8" />
            </button>
        </div>
      );
  }

  return (
    <div className={`bg-brand-surface border border-brand-secondary rounded-xl p-4 md:p-6 flex items-center justify-between transition-all duration-300 ${isCompletedToday ? 'opacity-50' : ''}`}>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2 py-1 rounded-full">{identityTag}</span>
          <span className="text-xs text-brand-text-muted">{cue}</span>
        </div>
        {microVersion ? (
            <div>
                 <p className="text-lg font-semibold text-brand-primary">{microVersion.title}</p>
                 <p className="text-sm text-brand-text-muted mt-1 line-through">{title}</p>
            </div>
        ) : (
            <p className="text-lg font-semibold text-brand-text">{title}</p>
        )}
        
        {description && !microVersion && (
          <p className="text-sm text-brand-text-muted mt-1">{description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-brand-text-muted">
            <div className="flex items-center gap-1">
                <Icon name="fire" className="w-5 h-5 text-brand-warning" />
                <span className="font-bold text-lg text-brand-text">{streak}</span>
                <span className="text-sm"> day streak</span>
            </div>
            {(momentumShields > 0) && (
                 <div className="flex items-center gap-1" title={`${momentumShields} Momentum Shield(s) available`}>
                    <Icon name="shield" solid className="w-5 h-5 text-brand-safe" />
                    <span className="font-bold text-lg text-brand-text">{momentumShields}</span>
                </div>
            )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
         <button
          onClick={() => onSetPriority(habit.id)}
          className={`p-2 rounded-full transition-colors duration-200 ${isPriority ? 'text-yellow-400 hover:text-yellow-500' : 'text-brand-text-muted hover:text-yellow-400'}`}
          aria-label={`Set as priority: ${title}`}
        >
          <Icon name="star" solid={isPriority} className="w-5 h-5" />
        </button>
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
              ? 'bg-brand-safe text-white scale-100' 
              : 'bg-brand-bg border-2 border-brand-secondary text-brand-text-muted hover:bg-brand-primary hover:border-brand-primary hover:text-white hover:scale-110'}`}
          aria-label={`Complete habit: ${title}`}
        >
          <Icon name="check" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};