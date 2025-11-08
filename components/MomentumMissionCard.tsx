import React, { useContext } from 'react';
import { Mission } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface MomentumMissionCardProps {
  mission: Mission;
  habitTitle: string;
}

export const MomentumMissionCard: React.FC<MomentumMissionCardProps> = ({ mission, habitTitle }) => {
  const { t } = useContext(LanguageContext)!;
  const progressPercentage = (mission.currentCompletions / mission.targetCompletions) * 100;

  return (
    <div className="bg-brand-surface border-2 border-dashed border-brand-primary/50 rounded-xl p-6 animate-fade-in mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
        <Icon name="sparkles" className="w-6 h-6 text-brand-primary" />
        {t('dashboard.mission.title')}
      </h2>
      <div className="md:flex gap-6 items-center">
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-brand-text">{mission.title}</h3>
            <p className="text-brand-text-muted mt-1">{mission.description}</p>
            <p className="text-sm font-semibold text-brand-primary mt-2">{t('dashboard.mission.targetHabit', { habitTitle })}</p>
        </div>
        <div className="flex-shrink-0 mt-4 md:mt-0 text-center">
            <p className="text-3xl font-bold">{mission.currentCompletions} / {mission.targetCompletions}</p>
            <p className="text-sm text-brand-text-muted">{t('dashboard.mission.completions')}</p>
        </div>
      </div>
       <div className="w-full bg-brand-bg rounded-full h-2.5 mt-4">
          <div
            className="bg-brand-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
    </div>
  );
};
