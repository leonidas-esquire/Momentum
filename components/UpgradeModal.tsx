import React, { useContext } from 'react';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface UpgradeModalProps {
  reason: string;
  onClose: () => void;
  onUpgrade: () => void;
}

const FeatureItem: React.FC<{ icon: string; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <Icon name={icon} className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
            <p className="font-semibold text-brand-text">{title}</p>
            <p className="text-sm text-brand-text-muted">{description}</p>
        </div>
    </div>
);

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ reason, onClose, onUpgrade }) => {
  const { t } = useContext(LanguageContext)!;

  const reasonText = {
      'habit': t('upgradeModal.reason.habit'),
      'identity': t('upgradeModal.reason.identity'),
      'translation': t('upgradeModal.reason.translation'),
      'header': ''
  }[reason] || '';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-primary/50 shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-yellow-400" />
            {t('upgradeModal.title')}
          </h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </div>

        {reasonText && (
             <div className="bg-brand-bg text-center p-3 rounded-lg mb-6">
                <p className="font-semibold text-brand-text">{reasonText}</p>
            </div>
        )}

        <div className="space-y-5">
            <FeatureItem icon="plus" title={t('upgradeModal.feature1')} description={t('upgradeModal.feature1Desc')} />
            <FeatureItem icon="users" title={t('upgradeModal.feature2')} description={t('upgradeModal.feature2Desc')} />
            <FeatureItem icon="speaker-wave" title={t('upgradeModal.feature3')} description={t('upgradeModal.feature3Desc')} />
            <FeatureItem icon="shield" title={t('upgradeModal.feature4')} description={t('upgradeModal.feature4Desc')} />
        </div>
        
        <div className="mt-8 flex flex-col gap-4">
            <button
                onClick={onUpgrade}
                className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300"
            >
                {t('upgradeModal.cta')}
            </button>
            <button
                onClick={onClose}
                className="w-full text-brand-text-muted font-semibold py-2 px-6 rounded-full hover:bg-brand-secondary/20 transition-colors"
            >
                {t('upgradeModal.close')}
            </button>
        </div>
      </div>
    </div>
  );
};