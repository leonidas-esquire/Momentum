import React, { useState, useEffect, useContext } from 'react';
import { Habit, RallyPointData } from '../types';
import { Icon } from './Icon';
import { generateRallyPoint } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';

interface RallyPointModalProps {
  habit: Habit;
  onComplete: (rallyBeaconLit: boolean) => void;
}

export const RallyPointModal: React.FC<RallyPointModalProps> = ({ habit, onComplete }) => {
  const [rallyData, setRallyData] = useState<RallyPointData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [lightRallyBeacon, setLightRallyBeacon] = useState(false);
  const { language, t } = useContext(LanguageContext)!;

  useEffect(() => {
    generateRallyPoint(habit, language)
      .then(data => {
        setRallyData(data);
        setIsLoading(false);
      });
  }, [habit, language]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border-2 border-brand-primary/50 shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="text-center">
            <div className="w-20 h-20 bg-brand-primary/10 border-4 border-brand-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Icon name="arrow-uturn-left" className="w-12 h-12 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('rallyPoint.title')}</h2>
            <p className="text-brand-text-muted mb-6">
                {t('rallyPoint.subtitle', { streak: habit.streak, habit: habit.title })}
            </p>
        </div>
        
        {isLoading && (
            <div className="text-center text-brand-text-muted space-y-2">
                <Icon name="sparkles" className="w-8 h-8 mx-auto animate-pulse mb-2 text-brand-primary" />
                <p>{t('rallyPoint.loading')}</p>
            </div>
        )}

        {rallyData && !selectedProtocol && (
             <div className="space-y-4 animate-fade-in">
                <p className="font-semibold text-center text-lg">{rallyData.question}</p>
                <div className="space-y-3">
                    {rallyData.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedProtocol(option.protocol)}
                            className="w-full bg-brand-bg border border-brand-secondary text-brand-text font-semibold p-4 rounded-lg text-left hover:border-brand-primary hover:bg-brand-primary/10 transition-colors duration-200"
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {selectedProtocol && (
            <div className="animate-fade-in">
                <h3 className="text-lg font-bold text-brand-primary text-center mb-4">{t('rallyPoint.protocolTitle')}</h3>
                <div className="bg-brand-bg p-4 rounded-lg text-center mb-6">
                    <p className="text-brand-text italic text-lg">"{selectedProtocol}"</p>
                </div>
                <div 
                    onClick={() => setLightRallyBeacon(!lightRallyBeacon)}
                    className="flex items-start gap-3 bg-brand-surface p-4 rounded-lg border-2 border-brand-secondary hover:border-brand-warning/50 cursor-pointer"
                >
                    <div className={`mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${lightRallyBeacon ? 'bg-brand-warning border-brand-warning' : 'border-brand-secondary'}`}>
                        {lightRallyBeacon && <Icon name="check" className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                        <p className="font-semibold text-brand-warning">{t('rallyPoint.beacon.title')}</p>
                        <p className="text-sm text-brand-text-muted">{t('rallyPoint.beacon.subtitle')}</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => onComplete(lightRallyBeacon)} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors">
                        {t('rallyPoint.button')}
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};