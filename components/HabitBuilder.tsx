import React, { useState, useEffect, useContext } from 'react';
import { Habit, User, Reminder } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface HabitBuilderProps {
  user: User;
  habitToEdit?: Habit | null;
  onSaveHabit: (habitData: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'lastCompleted' | 'completions' | 'momentumShields' | 'missedDays'> | Habit) => void;
  onClose: () => void;
}

export const HabitBuilder: React.FC<HabitBuilderProps> = ({ user, habitToEdit, onSaveHabit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [identityTag, setIdentityTag] = useState(user.selectedIdentities[0]?.name || '');
  const [cue, setCue] = useState('In the morning');
  const [reminder, setReminder] = useState<Reminder | undefined>(habitToEdit?.reminder);
  const { t } = useContext(LanguageContext)!;

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setIdentityTag(habitToEdit.identityTag);
      setCue(habitToEdit.cue);
      setReminder(habitToEdit.reminder);
    }
  }, [habitToEdit]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && identityTag.trim() && cue.trim()) {
      const habitBase = {
        title,
        description: description.trim() ? description.trim() : undefined,
        identityTag,
        cue,
        reminder,
      };

      if (habitToEdit) {
        onSaveHabit({
          ...habitToEdit,
          ...habitBase,
        });
      } else {
        onSaveHabit(habitBase);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{habitToEdit ? t('habitBuilder.editTitle') : t('habitBuilder.title')}</h2>
            <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">{t('habitBuilder.question1')}</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('habitBuilder.placeholder1')}
                    className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    required
                />
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('habitBuilder.placeholder2')}
                    className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none mt-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">{t('habitBuilder.question2')}</label>
                <select
                    value={identityTag}
                    onChange={(e) => setIdentityTag(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    required
                >
                    {user.selectedIdentities.map(id => (
                        <option key={id.id} value={id.name}>{id.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">{t('habitBuilder.question3')}</label>
                <select
                    value={cue}
                    onChange={(e) => setCue(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    required
                >
                    <option value="In the morning">{t('habitBuilder.cueMorning')}</option>
                    <option value="After my workout">{t('habitBuilder.cueWorkout')}</option>
                    <option value="During my lunch break">{t('habitBuilder.cueLunch')}</option>
                    <option value="Before bed">{t('habitBuilder.cueBed')}</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">Set a Reminder</label>
                <div className="flex bg-brand-bg border border-brand-secondary rounded-lg p-1 space-x-1">
                    <button type="button" onClick={() => setReminder(undefined)} className={`w-full py-2 rounded-md font-semibold transition-colors ${!reminder ? 'bg-brand-surface text-brand-text shadow' : 'text-brand-text-muted hover:bg-brand-surface/50'}`}>None</button>
                    <button type="button" onClick={() => setReminder({ type: 'time', time: '09:00' })} className={`w-full py-2 rounded-md font-semibold transition-colors ${reminder?.type === 'time' ? 'bg-brand-surface text-brand-text shadow' : 'text-brand-text-muted hover:bg-brand-surface/50'}`}>Time</button>
                    <button type="button" onClick={() => setReminder({ type: 'location', location: 'home', locationLabel: 'When I arrive home' })} className={`w-full py-2 rounded-md font-semibold transition-colors ${reminder?.type === 'location' ? 'bg-brand-surface text-brand-text shadow' : 'text-brand-text-muted hover:bg-brand-surface/50'}`}>Location</button>
                </div>
                {reminder?.type === 'time' && (
                    <div className="mt-2">
                        <input
                            type="time"
                            value={reminder.time}
                            onChange={(e) => setReminder({ ...reminder, time: e.target.value })}
                            className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            required
                        />
                    </div>
                )}
                {reminder?.type === 'location' && (
                    <div className="mt-2">
                        <select
                            value={reminder.location}
                            onChange={(e) => setReminder({ ...(reminder || { type: 'location' }), location: e.target.value as 'home' | 'work', locationLabel: e.target.options[e.target.selectedIndex].text })}
                            className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            required
                        >
                            <option value="home">When I arrive home</option>
                            <option value="work">When I arrive at work</option>
                        </select>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2"
                >
                    {habitToEdit ? t('habitBuilder.editButton') : t('habitBuilder.button')} 
                    <Icon name={habitToEdit ? 'check' : 'plus'} className="w-5 h-5"/>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};