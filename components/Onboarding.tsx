import React, { useState, useContext } from 'react';
import { Identity, User, Habit, BlueprintHabit } from '../types';
import { IDENTITY_ARCHETYPES } from '../constants';
import { generateHabitBlueprint } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';
import { Icon } from './Icon';

interface OnboardingProps {
    onOnboardingComplete: (user: Omit<User, 'id' | 'subscription'>, habits: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays' | 'isFavorite'>[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onOnboardingComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
    const [blueprintHabits, setBlueprintHabits] = useState<BlueprintHabit[]>([]);
    const [selectedHabits, setSelectedHabits] = useState<BlueprintHabit[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { language, t } = useContext(LanguageContext)!;

    const handleSelectIdentity = async (identity: Identity) => {
        setSelectedIdentity(identity);
        setIsLoading(true);
        setStep(2);
        const habits = await generateHabitBlueprint(identity.name, language);
        setBlueprintHabits(habits);
        setSelectedHabits(habits);
        setIsLoading(false);
    };

    const toggleHabitSelection = (habit: BlueprintHabit) => {
        setSelectedHabits(prev =>
            prev.some(h => h.title === habit.title)
                ? prev.filter(h => h.title !== habit.title)
                : [...prev, habit]
        );
    };

    const handleComplete = () => {
        if (!name.trim() || !selectedIdentity) return;
        
        const user = {
            name,
            email: '',
            selectedIdentities: [selectedIdentity],
            language: language,
            theme: 'dark' as const,
            voicePreference: 'Zephyr'
        };

        const habits = selectedHabits.map(h => ({
            title: h.title,
            description: h.description,
            cue: h.cue,
            identityTag: selectedIdentity.name,
        }));
        
        onOnboardingComplete(user, habits);
    };

    return (
        <div className="bg-brand-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                {step === 1 && (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-3xl font-bold mb-4">Welcome to Momentum</h1>
                        <p className="text-lg text-brand-text-muted mb-8">Who are you becoming?</p>
                        <div className="grid grid-cols-2 gap-4">
                            {IDENTITY_ARCHETYPES.map(identity => (
                                <button key={identity.id} onClick={() => handleSelectIdentity(identity)} className="bg-brand-surface p-4 rounded-lg hover:ring-2 ring-brand-primary transition-all">
                                    <p className="font-bold">{identity.name}</p>
                                    <p className="text-sm text-brand-text-muted">{identity.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-2">Here is your starting blueprint</h2>
                        <p className="text-brand-text-muted text-center mb-6">Based on your identity as **{selectedIdentity?.name}**. Select the habits you'd like to start with.</p>
                        {isLoading ? <p>Loading...</p> : (
                            <div className="space-y-3 mb-6">
                                {blueprintHabits.map((habit, index) => (
                                    <div key={index} onClick={() => toggleHabitSelection(habit)} className={`p-4 rounded-lg cursor-pointer border-2 ${selectedHabits.some(h => h.title === habit.title) ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-secondary bg-brand-surface'}`}>
                                        <p className="font-bold">{habit.title}</p>
                                        <p className="text-sm text-brand-text-muted">{habit.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                         <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-2">What should we call you?</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                required
                            />
                        </div>
                        <button onClick={handleComplete} disabled={!name.trim() || selectedHabits.length === 0} className="w-full mt-6 bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-brand-secondary">
                            Let's Go <Icon name="arrow-right" className="w-5 h-5"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
