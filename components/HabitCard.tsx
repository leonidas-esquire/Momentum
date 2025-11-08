import React from 'react';
import { Habit } from '../types';
import { Icon } from './Icon';
import { isToday } from '../utils/date';
import { triggerVibration, playCompletionSound } from '../utils/feedback';

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartVoiceNote: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onUndo, onDelete, onToggleFavorite, onStartVoiceNote }) => {
  const isCompleted = isToday(habit.lastCompleted);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(habit.id);
    triggerVibration();
    playCompletionSound();
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUndo(habit.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(habit.id);
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(habit.id);
  }

  const handleVoiceNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartVoiceNote(habit.id);
  }

  return (
    <div className={`bg-brand-surface rounded-lg p-4 flex items-center gap-4 transition-all duration-300 ${isCompleted ? 'bg-brand-surface/70 opacity-80' : ''} ${habit.isFavorite ? 'ring-2 ring-yellow-400/80' : 'border-2 border-transparent'}`}>
      <div className="flex-grow">
        <p className="font-bold text-lg text-brand-text">{habit.title}</p>
        {habit.description && <p className="text-sm text-brand-text-muted max-w-prose">{habit.description}</p>}
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
      <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
        <button onClick={handleToggleFavorite} className="text-brand-text-muted hover:text-yellow-400 p-2 rounded-full hover:bg-brand-secondary/20 transition-colors">
            <Icon name="star" solid={habit.isFavorite} className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button onClick={handleDelete} className="text-brand-text-muted hover:text-brand-danger p-2 rounded-full hover:bg-brand-secondary/20 transition-colors">
            <Icon name="trash" className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {isCompleted ? (
            <button onClick={handleUndo} className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-safe rounded-full flex items-center justify-center text-white transition-transform transform hover:scale-110">
                <Icon name="check" className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
        ) : (
            <button onClick={handleComplete} className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-surface border-2 border-brand-secondary rounded-full flex items-center justify-center text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors">
                <Icon name="check" className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
        )}
        
        {!isCompleted && (
            <button onClick={handleVoiceNote} className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-secondary rounded-full flex items-center justify-center text-white hover:bg-brand-primary transition-colors">
                <Icon name="microphone" className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
        )}
      </div>
    </div>
  );
};
