import React, { useState, useContext } from 'react';
import { User, Identity, BlueprintHabit, Habit } from '../types';
import { IDENTITY_ARCHETYPES } from '../constants';
import { Icon } from './Icon';
import { generateHabitBlueprint } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';

interface OnboardingProps {
  onComplete: (user: User, habits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>[]) => void;
  onTriggerUpgrade: (reason: string) => void;
  onShowPrivacyPolicy: () => void;
  onShowTermsOfService: () => void;
}

type OnboardingStep = 'welcome' | 'user-info' | 'identity-select' | 'blueprint' | 'loss-framing' | 'statement' | 'complete';

const IdentityCard: React.FC<{
    identity: Identity;
    isSelected: boolean;
    onClick: () => void;
}> = ({ identity, isSelected, onClick }) => (
    <div onClick={onClick} className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform ${isSelected ? 'ring-4 ring-brand-primary scale-105' : 'ring-2 ring-transparent hover:scale-105'}`}>
        <img src={identity.image} alt={identity.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
            <h3 className="text-xl md:text-2xl font-bold">{identity.name}</h3>
            <p className="text-sm md:text-base text-gray-300">{identity.description}</p>
        </div>
        {isSelected && (
            <div className="absolute top-4 right-4 bg-brand-primary rounded-full p-2 text-white">
                <Icon name="check" className="w-5 h-5" />
            </div>
        )}
    </div>
);

const BlueprintHabitCard: React.FC<{
    habit: BlueprintHabit;
    isSelected: boolean;
    onToggle: () => void;
}> = ({ habit, isSelected, onToggle }) => (
    <div onClick={onToggle} className={`bg-brand-bg border-2 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${isSelected ? 'border-brand-primary' : 'border-brand-secondary hover:border-brand-primary/50'}`}>
        <div className="flex items-start gap-3">
            <div className={`mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-brand-secondary'}`}>
                {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
            </div>
            <div>
                <p className="font-semibold text-brand-text">{habit.title}</p>
                <p className="text-sm text-brand-text-muted">{habit.description}</p>
                <p className="text-xs text-brand-primary mt-1">{habit.cue}</p>
            </div>
        </div>
    </div>
);


export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onTriggerUpgrade, onShowPrivacyPolicy, onShowTermsOfService }) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hasConsented, setHasConsented] = useState(false);
  const [selectedIdentities, setSelectedIdentities] = useState<Identity[]>([]);
  const [currentLossFramingIndex, setCurrentLossFramingIndex] = useState(0);
  const [lossFramingAnswers, setLossFramingAnswers] = useState<Record<string, string>>({});
  const [identityStatements, setIdentityStatements] = useState<Record<string, string>>({});
  
  const [blueprintResults, setBlueprintResults] = useState<Record<string, BlueprintHabit[]>>({});
  const [selectedBlueprintHabits, setSelectedBlueprintHabits] = useState<Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields'>[]>([]);
  const [isLoadingBlueprint, setIsLoadingBlueprint] = useState(false);
  // Fix: Used LanguageContext to get the current language for the API call.
  const { language, t } = useContext(LanguageContext)!;


  const handleIdentityToggle = (identity: Identity) => {
    setSelectedIdentities(prev => {
      const isSelected = prev.some(i => i.id === identity.id);
      if (isSelected) {
        return prev.filter(i => i.id !== identity.id);
      }
      if (prev.length < 1) {
        return [...prev, identity];
      }
      onTriggerUpgrade('identity');
      return prev;
    });
  };

  const handleGenerateBlueprints = async () => {
    setIsLoadingBlueprint(true);
    const results: Record<string, BlueprintHabit[]> = {};
    await Promise.all(selectedIdentities.map(async (identity) => {
        // Fix: Passed the 'language' argument to the 'generateHabitBlueprint' function.
        const habits = await generateHabitBlueprint(identity.name, language);
        results[identity.name] = habits;
    }));
    setBlueprintResults(results);
    setIsLoadingBlueprint(false);
  };
  
  const handleToggleBlueprintHabit = (habit: BlueprintHabit, identityName: string) => {
    const habitToAdd = { ...habit, identityTag: identityName };
    setSelectedBlueprintHabits(prev => {
      const isSelected = prev.some(h => h.title === habit.title && h.identityTag === identityName);
      if (isSelected) {
        return prev.filter(h => h.title !== habit.title || h.identityTag !== identityName);
      } else {
        return [...prev, habitToAdd];
      }
    });
  };
  
  const currentIdentity = selectedIdentities[currentLossFramingIndex];

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Momentum</h1>
            <p className="text-xl md:text-2xl text-brand-text-muted mb-8">The app that makes you miss it when you skip it.</p>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">First, let's answer a simple question:</h2>
            <p className="text-3xl md:text-4xl font-bold text-brand-primary mb-10">"Who are you becoming?"</p>
            <button onClick={() => setStep('user-info')} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
              Let's Begin <Icon name="arrow-right" className="w-5 h-5" />
            </button>
          </div>
        );
      
      case 'user-info':
        return (
          <div className="text-center animate-fade-in max-w-sm mx-auto">
            <h2 className="text-4xl font-bold mb-2">{t('onboarding.userInfo.title')}</h2>
            <p className="text-lg text-brand-text-muted mb-8">{t('onboarding.userInfo.subtitle')}</p>
            <form onSubmit={(e) => { e.preventDefault(); setStep('identity-select'); }} className="space-y-4 text-left">
              <div>
                <input
                  type="text"
                  placeholder={t('onboarding.userInfo.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-secondary/50 rounded-lg p-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t('onboarding.userInfo.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-secondary/50 rounded-lg p-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  required
                />
              </div>
               <div className="pt-2">
                  <label htmlFor="consent-checkbox" className="flex items-center gap-3 text-sm text-brand-text-muted cursor-pointer group">
                     <div className={`w-6 h-6 rounded border-2 ${hasConsented ? 'border-brand-primary bg-brand-primary' : 'border-brand-secondary group-hover:border-brand-primary'} flex-shrink-0 flex items-center justify-center transition-colors`}>
                        {hasConsented && <Icon name="check" className="w-4 h-4 text-white" />}
                    </div>
                    <input
                      id="consent-checkbox"
                      type="checkbox"
                      checked={hasConsented}
                      onChange={(e) => setHasConsented(e.target.checked)}
                      className="sr-only"
                      required
                    />
                    <span className="text-left">
                      {t('onboarding.consent.prefix')}{' '}
                      <button type="button" onClick={onShowPrivacyPolicy} className="font-medium text-brand-primary hover:underline">{t('onboarding.consent.privacyPolicy')}</button>{' '}
                      {t('onboarding.consent.and')}{' '}
                      <button type="button" onClick={onShowTermsOfService} className="font-medium text-brand-primary hover:underline">{t('onboarding.consent.terms')}</button>.
                    </span>
                  </label>
                </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={!name.trim() || !email.trim() || !hasConsented}
                  className="w-full bg-brand-primary text-white font-bold py-4 px-8 rounded-xl text-lg disabled:bg-brand-secondary disabled:cursor-not-allowed hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t('onboarding.buttons.next')}
                </button>
              </div>
            </form>
          </div>
        );

      case 'identity-select':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{t('onboarding.identity.title')}</h2>
            <p className="text-brand-text-muted text-center mb-8">{t('onboarding.identity.subtitle')}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {IDENTITY_ARCHETYPES.map(identity => (
                <IdentityCard key={identity.id} identity={identity} isSelected={selectedIdentities.some(i => i.id === identity.id)} onClick={() => handleIdentityToggle(identity)} />
              ))}
            </div>
            <div className="text-center mt-8">
                <button onClick={() => setStep('blueprint')} disabled={selectedIdentities.length === 0} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg disabled:bg-brand-secondary disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                    {t('onboarding.buttons.next')} <Icon name="arrow-right" className="w-5 h-5" />
                </button>
            </div>
          </div>
        );
        
      case 'blueprint':
        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                {isLoadingBlueprint && (
                    <div className="text-center">
                        <Icon name="sparkles" className="w-12 h-12 text-brand-primary mx-auto animate-pulse" />
                        <h2 className="text-2xl font-bold mt-4">{t('onboarding.blueprint.loadingTitle')}</h2>
                        <p className="text-brand-text-muted">{t('onboarding.blueprint.loadingSubtitle')}</p>
                    </div>
                )}
                {!isLoadingBlueprint && Object.keys(blueprintResults).length > 0 && (
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{t('onboarding.blueprint.resultsTitle')}</h2>
                        <p className="text-brand-text-muted text-center mb-8">{t('onboarding.blueprint.resultsSubtitle')}</p>
                        <div className="space-y-6">
                            {selectedIdentities.map(identity => (
                                <div key={identity.id}>
                                    <h3 className="font-bold text-lg text-brand-primary mb-2">{identity.name}</h3>
                                    <div className="space-y-3">
                                        {blueprintResults[identity.name]?.map(habit => (
                                            <BlueprintHabitCard 
                                                key={habit.title} 
                                                habit={habit}
                                                isSelected={selectedBlueprintHabits.some(h => h.title === habit.title && h.identityTag === identity.name)}
                                                onToggle={() => handleToggleBlueprintHabit(habit, identity.name)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <button onClick={() => setStep('loss-framing')} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                                {selectedBlueprintHabits.length > 0 ? t('onboarding.buttons.adopt', { count: selectedBlueprintHabits.length }) : t('onboarding.buttons.continue')} <Icon name="arrow-right" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                {!isLoadingBlueprint && Object.keys(blueprintResults).length === 0 && (
                     <div className="text-center bg-brand-surface border border-brand-secondary rounded-xl p-8">
                        <Icon name="light-bulb" className="w-12 h-12 mx-auto text-brand-primary mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">{t('onboarding.blueprint.promptTitle')}</h2>
                        <p className="text-brand-text-muted mb-6">{t('onboarding.blueprint.promptSubtitle')}</p>
                        <div className="flex justify-center gap-4">
                             <button onClick={() => setStep('loss-framing')} className="bg-brand-secondary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300">
                                {t('onboarding.buttons.noThanks')}
                            </button>
                            <button onClick={handleGenerateBlueprints} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                                <Icon name="sparkles" className="w-5 h-5"/> {t('onboarding.buttons.generate')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
        
      case 'loss-framing':
        return (
            <div className="text-center animate-slide-in-up">
                <p className="text-lg text-brand-primary font-semibold mb-2">{t('onboarding.lossFraming.header', { current: currentLossFramingIndex + 1, total: selectedIdentities.length, name: currentIdentity.name })}</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('onboarding.lossFraming.title')}</h2>
                <textarea 
                    className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    rows={4}
                    placeholder={t('onboarding.lossFraming.placeholder')}
                    value={lossFramingAnswers[currentIdentity.id] || ''}
                    onChange={(e) => setLossFramingAnswers({...lossFramingAnswers, [currentIdentity.id]: e.target.value})}
                />
                <button 
                    onClick={() => {
                        if (currentLossFramingIndex < selectedIdentities.length - 1) {
                            setCurrentLossFramingIndex(currentLossFramingIndex + 1);
                        } else {
                            // Pre-populate identity statements
                            const newStatements: Record<string, string> = {};
                            selectedIdentities.forEach(id => {
                                newStatements[id.id] = `I am a ${id.name} who...`;
                            });
                            setIdentityStatements(newStatements);
                            setStep('statement');
                        }
                    }}
                    className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto"
                >
                    {t('onboarding.buttons.next')} <Icon name="arrow-right" className="w-5 h-5" />
                </button>
            </div>
        );
      
      case 'statement':
          return (
              <div className="animate-slide-in-up">
                  <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('onboarding.statement.title')}</h2>
                  <div className="space-y-6">
                      {selectedIdentities.map(identity => (
                          <div key={identity.id}>
                              <label className="block text-brand-primary font-semibold mb-2">{identity.name}</label>
                              <input 
                                  type="text"
                                  className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                  value={identityStatements[identity.id] || ''}
                                  onChange={(e) => setIdentityStatements({...identityStatements, [identity.id]: e.target.value})}
                              />
                          </div>
                      ))}
                  </div>
                   <button 
                      onClick={() => {
                          const now = new Date().toISOString();
                          const newUser: User = {
                              id: `user-${Date.now()}`,
                              name,
                              email,
                              selectedIdentities: selectedIdentities.map(identity => ({
                                  ...identity,
                                  level: 1,
                                  xp: 0,
                              })),
                              identityStatements,
                              onboardingCompleted: true,
                              lastHuddleDate: null,
                              language,
                              theme: 'dark',
                              subscription: { plan: 'free' },
                              dailyTranslations: { date: '', count: 0 },
                              consent: {
                                privacyPolicy: now,
                                termsOfService: now,
                              },
                              dailyDebriefs: [],
                              // Fix: Added missing 'momentumCharges' property to the User object.
                              momentumCharges: 0,
                          };
                          onComplete(newUser, selectedBlueprintHabits);
                      }}
                      className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto"
                  >
                      {t('onboarding.buttons.finish')} <Icon name="check" className="w-5 h-5" />
                  </button>
              </div>
          );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-brand-bg p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
          {renderStep()}
      </div>
    </div>
  );
};