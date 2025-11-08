import React, { useContext } from 'react';
import { SquadSaga } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface SquadSagaWidgetProps {
    saga: SquadSaga;
}

export const SquadSagaWidget: React.FC<SquadSagaWidgetProps> = ({ saga }) => {
    const { t } = useContext(LanguageContext)!;
    const bossHealthPercentage = (saga.boss.hp / saga.boss.maxHp) * 100;

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="text-center">
                <h3 className="text-xl font-bold">{saga.title} - Chapter {saga.chapter}</h3>
                <p className="text-brand-text-muted italic">"{saga.lore}"</p>
            </div>

            <div className="bg-brand-bg p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{t('squadHub.saga.milestones')}</h4>
                <ul className="space-y-2">
                    {saga.milestones.map((milestone, index) => (
                        <li key={index} className={`flex items-center gap-2 text-sm ${milestone.isCompleted ? 'text-brand-text-muted line-through' : 'text-brand-text'}`}>
                            <Icon name="check" className={`w-4 h-4 flex-shrink-0 ${milestone.isCompleted ? 'text-brand-safe' : 'text-brand-secondary'}`} />
                            <span>{milestone.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="bg-brand-danger/10 p-4 rounded-lg border border-brand-danger/20">
                <h4 className="font-semibold text-brand-danger mb-2 flex items-center gap-2">
                    <Icon name="fire" className="w-5 h-5" />
                    {t('squadHub.saga.boss')} - {saga.boss.name}
                </h4>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-semibold text-brand-text-muted">HP</span>
                    <span className="font-bold text-brand-text">{saga.boss.hp} / {saga.boss.maxHp}</span>
                </div>
                 <div className="w-full bg-brand-bg rounded-full h-4 border border-brand-secondary p-0.5">
                    <div
                        className="bg-brand-danger h-full rounded-full transition-all duration-500"
                        style={{ width: `${bossHealthPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
