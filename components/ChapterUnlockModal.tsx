import React, { useState, useContext } from 'react';
import { ChapterUnlockData } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface ChapterUnlockModalProps {
  data: ChapterUnlockData;
  onClose: () => void;
  onAcceptMission: (missionData: ChapterUnlockData['masteryMission']) => void;
  onAdoptHabit: (newTitle: string) => void;
}

export const ChapterUnlockModal: React.FC<ChapterUnlockModalProps> = ({ data, onClose, onAcceptMission, onAdoptHabit }) => {
    const { t } = useContext(LanguageContext)!;
    const [missionAccepted, setMissionAccepted] = useState(false);

    const handleAcceptMission = () => {
        onAcceptMission(data.masteryMission);
        setMissionAccepted(true);
    };

    const handleAdopt = (suggestion: string) => {
        onAdoptHabit(suggestion);
    };

    return (
    <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-lg flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-2xl rounded-2xl border-2 border-brand-primary/50 shadow-2xl p-6 md:p-8 animate-slide-in-up text-center overflow-y-auto max-h-full">
        <div className="w-20 h-20 bg-brand-primary/10 border-4 border-brand-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
          <Icon name="book-open" className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-brand-primary mb-2">{t('chapterUnlock.title')}</h1>
        <p className="text-lg text-brand-text-muted mb-4">{t('chapterUnlock.subtitle', { identityName: data.identityName, newLevel: data.newLevel })}</p>
        <h2 className="text-2xl font-semibold text-brand-text mb-6">"{data.chapterTitle}"</h2>

        <div className="space-y-6 text-left">
            {/* Chapter Lore */}
            <div className="bg-brand-bg p-4 rounded-lg">
                <h3 className="font-semibold text-brand-primary mb-2">{t('chapterUnlock.loreTitle')}</h3>
                <p className="text-brand-text-muted italic">"{data.lore}"</p>
            </div>

            {/* Mastery Mission */}
            <div className={`bg-brand-bg p-4 rounded-lg border-2 ${missionAccepted ? 'border-brand-safe/50' : 'border-transparent'}`}>
                <h3 className="font-semibold text-brand-primary mb-2">{t('chapterUnlock.missionTitle')}</h3>
                <p className="font-bold text-lg text-brand-text">{data.masteryMission.title}</p>
                <p className="text-sm text-brand-text-muted mb-4">{data.masteryMission.description}</p>
                <button
                    onClick={handleAcceptMission}
                    disabled={missionAccepted}
                    className={`w-full font-bold py-2 px-4 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 ${
                        missionAccepted 
                        ? 'bg-brand-safe/20 text-brand-safe' 
                        : 'bg-brand-primary text-white hover:bg-opacity-80'
                    }`}
                >
                    <Icon name={missionAccepted ? 'check' : 'star'} className="w-5 h-5"/>
                    {missionAccepted ? t('chapterUnlock.missionAccepted') : t('chapterUnlock.missionAccept')}
                </button>
            </div>

            {/* Evolved Habits */}
            <div>
                <h3 className="font-semibold text-brand-primary mb-2">{t('chapterUnlock.evolveTitle')}</h3>
                <div className="space-y-2">
                    {data.evolvedHabits.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleAdopt(suggestion)}
                            className="w-full bg-brand-bg border border-brand-secondary text-brand-text font-semibold p-3 rounded-lg text-left hover:border-brand-primary hover:bg-brand-primary/10 transition-colors duration-200"
                        >
                           <span className="text-brand-primary mr-2">→</span> {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 text-sm font-semibold text-brand-text-muted hover:text-white bg-brand-secondary/50 py-2 px-6 rounded-full"
        >
          {t('chapterUnlock.continueButton')}
        </button>
      </div>
    </div>
  );
};
