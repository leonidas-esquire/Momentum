import React, { useContext } from 'react';
import { UserIdentity } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface IdentityStatusProps {
  identities: UserIdentity[];
}

const IdentityCard: React.FC<{ identity: UserIdentity }> = ({ identity }) => {
  const xpForNextLevel = identity.level * 100;
  const progressPercentage = (identity.xp / xpForNextLevel) * 100;

  return (
    <div className="bg-brand-surface border border-brand-secondary rounded-xl p-4 flex items-center gap-4">
      <img src={identity.image} alt={identity.name} className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-lg" />
      <div className="flex-grow">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-bold text-lg text-brand-text">{identity.name}</h3>
          <span className="text-sm font-semibold bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-full">
            Lv. {identity.level}
          </span>
        </div>
        <p className="text-xs text-brand-text-muted mb-2">
          {identity.xp} / {xpForNextLevel} XP
        </p>
        <div className="w-full bg-brand-bg rounded-full h-2.5">
          <div
            className="bg-brand-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const IdentityStatus: React.FC<IdentityStatusProps> = ({ identities }) => {
  const { t } = useContext(LanguageContext)!;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('dashboard.identity.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {identities.map(identity => (
          <IdentityCard key={identity.id} identity={identity} />
        ))}
      </div>
    </div>
  );
};
