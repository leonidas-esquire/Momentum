import React, { useState, useEffect, useContext } from 'react';
import { UserIdentity, Habit } from '../types';
import { generateHabitEvolutionSuggestions } from '../services/geminiService';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface LevelUpModalProps {
  identity: UserIdentity;
  habitToEvolve: Habit;
  onEvolve: (habitId: string, newTitle: string) => void;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ identity, habitToEvolve, onEvolve, onClose }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Fix: Used LanguageContext to get the current language for the API call.
  const { language } = useContext(LanguageContext)!;

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      // Fix: Passed the 'language' argument to the 'generateHabitEvolutionSuggestions' function.
      const newSuggestions = await generateHabitEvolutionSuggestions(identity.name, habitToEvolve.title, language);
      setSuggestions(newSuggestions);
      setIsLoading(false);
    };
    fetchSuggestions();
  }, [identity.name, habitToEvolve.title, language]);

  const handleEvolve = (suggestion: string) => {
    onEvolve(habitToEvolve.id, suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-primary shadow-2xl p-6 md:p-8 animate-slide-in-up text-center">
        <div className="w-20 h-20 bg-brand-primary/10 border-4 border-brand-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
          <Icon name="sparkles" className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-2xl font-bold text-brand-primary mb-2">LEVEL UP!</h2>
        <p className="text-lg text-brand-text mb-4">
          Your identity as <span className="font-bold">{identity.name}</span> has grown to Level {identity.level}!
        </p>
        <div className="bg-brand-bg p-4 rounded-lg my-6">
          <p className="text-brand-text-muted mb-2">You've mastered:</p>
          <p className="font-semibold text-lg">"{habitToEvolve.title}"</p>
        </div>
        <p className="text-brand-text-muted mb-4">Ready to evolve? Here are some ideas:</p>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full h-12 bg-brand-bg rounded-full animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleEvolve(suggestion)}
                className="w-full bg-brand-bg border border-brand-secondary text-brand-text font-semibold p-3 rounded-full text-center hover:border-brand-primary hover:bg-brand-primary/10 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-8 text-sm text-brand-text-muted hover:text-white"
        >
          I'll stick with my current routine
        </button>
      </div>
    </div>
  );
};
