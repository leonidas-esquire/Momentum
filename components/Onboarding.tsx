
import React, { useState } from 'react';
import { User, Identity } from '../types';
import { IDENTITY_ARCHETYPES } from '../constants';
import { Icon } from './Icon';

interface OnboardingProps {
  onComplete: (user: User) => void;
}

type OnboardingStep = 'welcome' | 'identity-select' | 'loss-framing' | 'statement' | 'complete';

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

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedIdentities, setSelectedIdentities] = useState<Identity[]>([]);
  const [currentLossFramingIndex, setCurrentLossFramingIndex] = useState(0);
  const [lossFramingAnswers, setLossFramingAnswers] = useState<Record<string, string>>({});
  const [identityStatements, setIdentityStatements] = useState<Record<string, string>>({});

  const handleIdentityToggle = (identity: Identity) => {
    setSelectedIdentities(prev => {
      const isSelected = prev.some(i => i.id === identity.id);
      if (isSelected) {
        return prev.filter(i => i.id !== identity.id);
      }
      if (prev.length < 3) {
        return [...prev, identity];
      }
      return prev;
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
            <button onClick={() => setStep('identity-select')} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
              Let's Begin <Icon name="arrow-right" className="w-5 h-5" />
            </button>
          </div>
        );
      
      case 'identity-select':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Choose Your Archetypes</h2>
            <p className="text-brand-text-muted text-center mb-8">(Select 1-3)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {IDENTITY_ARCHETYPES.map(identity => (
                <IdentityCard key={identity.id} identity={identity} isSelected={selectedIdentities.some(i => i.id === identity.id)} onClick={() => handleIdentityToggle(identity)} />
              ))}
            </div>
            <div className="text-center mt-8">
                <button onClick={() => setStep('loss-framing')} disabled={selectedIdentities.length === 0} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg disabled:bg-brand-secondary disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                    Next <Icon name="arrow-right" className="w-5 h-5" />
                </button>
            </div>
          </div>
        );
        
      case 'loss-framing':
        return (
            <div className="text-center animate-slide-in-up">
                <p className="text-lg text-brand-primary font-semibold mb-2">Identity {currentLossFramingIndex + 1} of {selectedIdentities.length}: {currentIdentity.name}</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-8">"What would you lose if you didn't become this?"</h2>
                <textarea 
                    className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    rows={4}
                    placeholder="e.g., career opportunities, meaningful connections, personal growth..."
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
                    Next <Icon name="arrow-right" className="w-5 h-5" />
                </button>
            </div>
        );
      
      case 'statement':
          return (
              <div className="animate-slide-in-up">
                  <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frame Your Identity Statements</h2>
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
                          const newUser: User = {
                              name: 'User',
                              selectedIdentities,
                              identityStatements,
                              onboardingCompleted: true,
                          };
                          onComplete(newUser);
                      }}
                      className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto"
                  >
                      Finish Setup <Icon name="check" className="w-5 h-5" />
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
