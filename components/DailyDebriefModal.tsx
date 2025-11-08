import React, { useState, useEffect, useContext } from 'react';
import { User, Habit, DailyDebrief } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';
import { generateDebriefQuestionsAndWin } from '../services/geminiService';

interface DailyDebriefModalProps {
  user: User;
  habits: Habit[];
  onClose: () => void;
  onSave: (debrief: DailyDebrief, sharedWin: string | null) => void;
}

type DebriefStep = 'mood' | 'guided' | 'private' | 'share';
type Mood = 'terrible' | 'bad' | 'okay' | 'good' | 'great';

const moods: { type: Mood, emoji: string }[] = [
    { type: 'terrible', emoji: '😫' },
    { type: 'bad', emoji: '😐' },
    { type: 'okay', emoji: '😊' },
    { type: 'good', emoji: '😄' },
    { type: 'great', emoji: '🚀' },
];

export const DailyDebriefModal: React.FC<DailyDebriefModalProps> = ({ user, habits, onClose, onSave }) => {
  const [step, setStep] = useState<DebriefStep>('mood');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [guidedQuestions, setGuidedQuestions] = useState<string[]>([]);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [privateNote, setPrivateNote] = useState('');
  const [shareableWin, setShareableWin] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { language, t } = useContext(LanguageContext)!;

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    setStep('guided');
    setIsLoadingAI(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const habitsToday = habits.map(h => ({
      title: h.title,
      completed: h.lastCompleted?.startsWith(todayStr) ?? false
    }));
    const { questions, shareableWin } = await generateDebriefQuestionsAndWin(habitsToday, privateNote, language);
    setGuidedQuestions(questions);
    setShareableWin(shareableWin); // Pre-load the shareable win
    setIsLoadingAI(false);
  };
  
  const handleAnswerChange = (question: string, answer: string) => {
    setGuidedAnswers(prev => ({...prev, [question]: answer}));
  };

  const handleSave = (share: boolean) => {
    if (!selectedMood) return;
    const debrief: DailyDebrief = {
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        guidedAnswers,
        privateNote,
        isShared: share,
    };
    onSave(debrief, share ? shareableWin : null);
  };

  const renderContent = () => {
    switch (step) {
      case 'mood':
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-6">{t('dailyDebrief.step1Title')}</h3>
            <div className="flex justify-around items-center">
              {moods.map(mood => (
                <button
                  key={mood.type}
                  onClick={() => handleMoodSelect(mood.type)}
                  className="text-5xl transform transition-transform duration-200 hover:scale-125"
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
        );
      case 'guided':
        return (
          <div>
            <h3 className="text-xl font-bold mb-6 text-center">{t('dailyDebrief.step2Title')}</h3>
            {isLoadingAI ? (
                 <div className="text-center text-brand-text-muted">
                    <Icon name="sparkles" className="w-8 h-8 mx-auto animate-pulse mb-2" />
                    {t('dailyDebrief.loading')}
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    {guidedQuestions.map((q, i) => (
                        <div key={i}>
                            <label className="block text-sm font-medium text-brand-text-muted mb-1">{q}</label>
                            <textarea
                                rows={2}
                                value={guidedAnswers[q] || ''}
                                onChange={(e) => handleAnswerChange(q, e.target.value)}
                                className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-2 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            />
                        </div>
                    ))}
                    <div className="text-center pt-4">
                        <button onClick={() => setStep('private')} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80">
                            {t('dailyDebrief.buttonNext')}
                        </button>
                    </div>
                </div>
            )}
          </div>
        );
      case 'private':
        return (
             <div>
                <h3 className="text-xl font-bold mb-4 text-center">{t('dailyDebrief.step3Title')}</h3>
                 <textarea
                    rows={4}
                    value={privateNote}
                    onChange={(e) => setPrivateNote(e.target.value)}
                    placeholder={t('dailyDebrief.step3Placeholder')}
                    className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                 <div className="text-center pt-4">
                    <button onClick={() => setStep('share')} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80">
                        {t('dailyDebrief.buttonNext')}
                    </button>
                </div>
            </div>
        );
        case 'share':
            return (
                 <div>
                    <h3 className="text-xl font-bold mb-2 text-center">{t('dailyDebrief.step4Title')}</h3>
                    <p className="text-sm text-brand-text-muted text-center mb-4">{t('dailyDebrief.step4Subtitle')}</p>
                     <textarea
                        rows={3}
                        value={shareableWin}
                        onChange={(e) => setShareableWin(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                     <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => handleSave(false)} className="bg-brand-secondary text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-80">
                            {t('dailyDebrief.buttonSave')}
                        </button>
                        <button onClick={() => handleSave(true)} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-80 flex items-center justify-center gap-2">
                           {t('dailyDebrief.buttonShare')} <Icon name="sparkles" className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('dailyDebrief.title')}</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
