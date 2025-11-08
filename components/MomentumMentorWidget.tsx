import React, { useContext } from 'react';
import { MentorIntervention } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface MomentumMentorWidgetProps {
  intervention: MentorIntervention;
  onAccept: (habitId: string, microHabit: { title: string }) => void;
  onDismiss: () => void;
}

export const MomentumMentorWidget: React.FC<MomentumMentorWidgetProps> = ({ intervention, onAccept, onDismiss }) => {
  const { t } = useContext(LanguageContext)!;

  return (
    <div className="bg-gradient-to-br from-brand-primary/10 via-brand-surface to-brand-surface border-2 border-brand-primary/50 rounded-xl p-6 animate-fade-in mb-8 shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-brand-primary">
        <Icon name="light-bulb" className="w-6 h-6" />
        {t('dashboard.mentorWidget.title')}
      </h2>
      <div className="md:flex gap-6 items-center">
        <div className="flex-grow">
          <p className="text-brand-text-muted italic">"{intervention.message}"</p>
        </div>
        <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col gap-2 items-stretch">
            <button 
                onClick={() => onAccept(intervention.habitId, intervention.microHabit)}
                className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 w-full"
            >
                {t('dashboard.mentorWidget.acceptButton')}
            </button>
            <button 
                onClick={onDismiss}
                className="text-brand-text-muted font-semibold py-2 px-4 rounded-full text-sm hover:bg-brand-secondary/20 transition-colors w-full"
            >
                {t('dashboard.mentorWidget.dismissButton')}
            </button>
        </div>
      </div>
    </div>
  );
};
