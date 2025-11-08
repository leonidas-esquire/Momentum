import React, { useContext } from 'react';
import { SquadQuest } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface SquadQuestCardProps {
    quest: SquadQuest;
    onComplete: () => void;
}

export const SquadQuestCard: React.FC<SquadQuestCardProps> = ({ quest, onComplete }) => {
    const { t } = useContext(LanguageContext)!;
    const { title, points, isCompleted, completedBy } = quest;

    return (
        <div className={`bg-brand-bg border-l-4 rounded-r-lg p-4 flex items-center justify-between transition-all duration-300 ${isCompleted ? 'border-brand-safe/50 opacity-60' : 'border-yellow-400'}`}>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <Icon name="trophy" className={`w-5 h-5 flex-shrink-0 ${isCompleted ? 'text-brand-safe' : 'text-yellow-400'}`} />
                    <p className="font-semibold text-brand-text">{title}</p>
                </div>
                {isCompleted && completedBy && (
                    <p className="text-xs text-brand-text-muted mt-1 ml-7">{t('squadHub.questCompletedBy', { name: completedBy })}</p>
                )}
            </div>
            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <span className={`font-bold text-lg ${isCompleted ? 'text-brand-safe' : 'text-yellow-400'}`}>
                    +{points}
                </span>
                <button
                    onClick={onComplete}
                    disabled={isCompleted}
                    className={`w-32 text-center font-bold py-2 px-4 rounded-full text-sm transition-colors duration-300
                        ${isCompleted 
                            ? 'bg-brand-safe/20 text-brand-safe cursor-not-allowed'
                            : 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/40'
                        }`}
                >
                    {isCompleted ? <Icon name="check" className="w-5 h-5 mx-auto" /> : t('squadHub.questCompleteButton')}
                </button>
            </div>
        </div>
    );
};
