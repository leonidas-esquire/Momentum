import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { Icon } from './Icon';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onRemove: (habitId: string) => void;
  isPriority?: boolean;
}

const getStreakColor = (isCompleted: boolean, hour: number): string => {
  if (isCompleted) return 'bg-brand-safe/20 text-brand-safe';
  if (hour < 12) return 'bg-brand-safe/20 text-brand-safe'; // Morning: Green
  if (hour < 18) return 'bg-brand-warning/20 text-brand-warning'; // Afternoon: Orange
  return 'bg-brand-danger/20 text-brand-danger animate-pulse'; // Evening: Red
};

const getStreakMessage = (isCompleted: boolean, hour: number): string => {
    if (isCompleted) return "Done for today!";
    if (hour < 12) return "You're on track";
    if (hour < 18) return "Don't forget!";
    return "Streak at risk!";
}

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-2 h-4" style={style}></div>
);

const Confetti: React.FC = () => {
    const colors = ['#8A42D6', '#22C55E', '#F97316', '#3B82F6'];
    const pieces = Array.from({ length: 20 }).map((_, i) => {
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animation: `confetti-burst 0.8s ease-out ${i * 0.02}s forwards`,
        };
        return <ConfettiPiece key={i} style={style} />;
    });

    return <div className="absolute inset-0 pointer-events-none">{pieces}</div>;
};


export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onRemove, isPriority = false }) => {
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const lastCompletedDay = habit.lastCompleted ? new Date(habit.lastCompleted).toISOString().split('T')[0] : null;
  const isCompletedToday = lastCompletedDay === today;

  useEffect(() => {
    setCompleted(isCompletedToday);
  }, [isCompletedToday]);

  const handleComplete = () => {
    if (!completed) {
      onComplete(habit.id);
      setCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };
  
  const currentHour = new Date().getHours();
  const streakColorClasses = getStreakColor(completed, currentHour);
  const streakMessage = getStreakMessage(completed, currentHour);

  const cardClasses = `
    relative w-full p-4 rounded-xl border transition-all duration-300
    ${completed ? 'bg-brand-surface/50 border-brand-secondary' : 'bg-brand-surface border-brand-surface hover:border-brand-primary'}
    ${isPriority ? 'md:p-6' : ''}
  `;

  return (
    <div className={cardClasses}>
        {showConfetti && <Confetti />}
        <button
            onClick={() => onRemove(habit.id)}
            className="absolute top-2 right-2 text-brand-secondary hover:text-brand-danger transition-colors duration-200 p-1 rounded-full opacity-50 hover:opacity-100"
            aria-label={`Remove ${habit.title}`}
        >
            <Icon name="trash" className="w-5 h-5" />
        </button>
      <div className="flex items-center gap-4">
        <button
          onClick={handleComplete}
          className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center transition-colors duration-300
          ${completed ? 'bg-brand-safe border-brand-safe' : 'border-brand-secondary hover:border-brand-primary'}
          ${completed ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`Complete ${habit.title}`}
          disabled={completed}
        >
          {completed && <Icon name="check" className="w-8 h-8 text-white" />}
        </button>
        <div className="flex-grow">
          <p className={`text-xs font-medium ${completed ? 'text-brand-text-muted' : 'text-brand-primary'}`}>{habit.identityTag}</p>
          <h3 className={`${isPriority ? 'text-xl md:text-2xl' : 'text-lg'} font-bold ${completed ? 'text-brand-text-muted line-through' : 'text-brand-text'}`}>{habit.title}</h3>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <span className={`text-2xl md:text-4xl font-bold ${completed ? 'text-brand-text-muted' : 'text-brand-text'}`}>{habit.streak}</span>
            <span className="text-lg md:text-xl text-brand-text-muted">🔥</span>
          </div>
          <p className={`text-xs px-2 py-0.5 rounded-full font-semibold ${streakColorClasses}`}>{streakMessage}</p>
        </div>
      </div>
    </div>
  );
};