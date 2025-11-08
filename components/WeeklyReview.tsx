

import React, { useState, useMemo, useContext } from 'react';
import { Habit } from '../types';
import { generateWeeklyInsight } from '../services/geminiService';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface WeeklyReviewProps {
  habits: Habit[];
  onClose: () => void;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ habits, onClose }) => {
  const [aiInsight, setAiInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Fix: Used LanguageContext to get the current language for the API call.
  const { language } = useContext(LanguageContext)!;
  
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const relevantCompletions = habits.flatMap(h => h.completions)
        .map(c => new Date(c))
        .filter(d => d >= oneWeekAgo);

    const totalPossible = habits.length * 7;
    const totalCompletions = relevantCompletions.length;
    const completionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
    
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    relevantCompletions.forEach(d => {
        dayCounts[d.getDay()]++;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const worstDayIndex = dayCounts.indexOf(Math.min(...dayCounts));
    const bestDay = dayNames[bestDayIndex];
    const worstDay = dayNames[worstDayIndex];

    const mostConsistentHabit = habits.reduce((prev, current) => (prev.streak > current.streak) ? prev : current, habits[0]);

    return {
      totalCompletions,
      completionRate,
      bestDay,
      worstDay,
      mostConsistentHabit: mostConsistentHabit?.title || 'None',
    };
  }, [habits]);

  const handleGetInsight = async () => {
    setIsLoading(true);
    try {
      // Fix: Passed the 'language' argument to the 'generateWeeklyInsight' function.
      const insight = await generateWeeklyInsight(weeklyStats, language);
      setAiInsight(insight);
    } catch (error) {
      console.error(error);
      setAiInsight("There was an error generating your insight. Keep up the great work!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-2xl rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Weekly Strategic Review</h2>
            <button onClick={onClose} className="text-brand-text-muted hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-brand-bg p-4 rounded-lg">
                    <p className="text-3xl font-bold text-brand-primary">{weeklyStats.totalCompletions}</p>
                    <p className="text-sm text-brand-text-muted">Completions</p>
                </div>
                <div className="bg-brand-bg p-4 rounded-lg">
                    <p className="text-3xl font-bold text-brand-primary">{weeklyStats.completionRate.toFixed(0)}%</p>
                    <p className="text-sm text-brand-text-muted">Success Rate</p>
                </div>
                 <div className="bg-brand-bg p-4 rounded-lg col-span-2 md:col-span-1">
                    <p className="text-xl font-bold text-brand-primary truncate">{weeklyStats.mostConsistentHabit}</p>
                    <p className="text-sm text-brand-text-muted">Top Habit</p>
                </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Insight</h3>
              <div className="bg-brand-bg p-4 rounded-lg min-h-[100px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-brand-text-muted">Generating your insight...</div>
                ) : aiInsight ? (
                  <p className="text-center text-brand-text italic">"{aiInsight}"</p>
                ) : (
                  <button onClick={handleGetInsight} className="bg-brand-primary/20 text-brand-primary font-bold py-3 px-6 rounded-full text-base hover:bg-brand-primary/40 transition-colors duration-300 flex items-center gap-2">
                    <Icon name="sparkles" className="w-5 h-5" /> Generate My Insight
                  </button>
                )}
              </div>
            </div>

            <div>
                 <h3 className="text-lg font-semibold mb-2">Next Week's Focus</h3>
                 <input
                    type="text"
                    placeholder="Set one micro-commitment for next week..."
                    className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
            </div>
            
        </div>
        <div className="text-center mt-8">
            <button onClick={onClose} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300">
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
