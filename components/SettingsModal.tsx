import React, { useState, useContext } from 'react';
import { User } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, TTS_VOICES } from '../constants';
import { ThemeContext } from '../contexts/ThemeContext';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onDeleteAccount: () => void;
  onShowPrivacyPolicy: () => void;
  onShowTermsOfService: () => void;
  onShowPlaybook: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdateUser, onDeleteAccount, onShowPrivacyPolicy, onShowTermsOfService, onShowPlaybook }) => {
  const { language, setLanguage, t } = useContext(LanguageContext)!;
  const { theme, setTheme } = useContext(ThemeContext)!;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    onUpdateUser({ ...user, language: newLang });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoice = e.target.value;
    onUpdateUser({ ...user, voicePreference: newVoice });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    onUpdateUser({ ...user, theme: newTheme });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">Theme</label>
            <div className="flex bg-brand-bg border border-brand-secondary rounded-lg p-1 space-x-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`w-full py-2 rounded-md font-semibold transition-colors ${theme === 'light' ? 'bg-brand-surface text-brand-text shadow' : 'text-brand-text-muted hover:bg-brand-surface/50'}`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`w-full py-2 rounded-md font-semibold transition-colors ${theme === 'dark' ? 'bg-brand-surface text-brand-text shadow' : 'text-brand-text-muted hover:bg-brand-surface/50'}`}
              >
                Dark
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">{t('settings.language')}</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">{t('settings.voice')}</label>
            <select
              value={user.voicePreference || TTS_VOICES[0].name}
              onChange={handleVoiceChange}
              className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              {TTS_VOICES.map(voice => (
                <option key={voice.name} value={voice.name}>{voice.name} ({voice.gender})</option>
              ))}
            </select>
          </div>

          <div className="border-t border-brand-secondary pt-6">
            <h3 className="text-lg font-semibold mb-4">Help &amp; Resources</h3>
            <div className="space-y-2">
               <button onClick={onShowPlaybook} className="w-full text-left bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text hover:border-brand-primary/50 flex justify-between items-center">
                <span>View App Playbook</span>
                <Icon name="book-open" className="w-5 h-5" />
              </button>
              <button onClick={onShowPrivacyPolicy} className="w-full text-left bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text hover:border-brand-primary/50 flex justify-between items-center">
                <span>{t('settings.viewPolicy')}</span>
                <Icon name="arrow-right" className="w-5 h-5" />
              </button>
              <button onClick={onShowTermsOfService} className="w-full text-left bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text hover:border-brand-primary/50 flex justify-between items-center">
                <span>{t('settings.viewTerms')}</span>
                <Icon name="arrow-right" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t border-brand-danger/20 pt-6">
            <h3 className="text-lg font-semibold text-brand-danger mb-2">{t('settings.deleteAccount')}</h3>
            <p className="text-sm text-brand-text-muted mb-4">{t('settings.deleteWarning')}</p>
            {showDeleteConfirm ? (
              <div className="bg-brand-danger/10 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                 <p className="font-bold text-brand-danger flex-grow">Are you absolutely sure?</p>
                 <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-brand-secondary/20">{t('settings.cancel')}</button>
                    <button onClick={onDeleteAccount} className="px-4 py-2 text-sm font-bold bg-brand-danger text-white rounded-full hover:bg-opacity-80">{t('settings.confirmDelete')}</button>
                 </div>
              </div>
            ) : (
                <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-brand-danger/10 text-brand-danger font-bold py-3 px-4 rounded-full hover:bg-brand-danger/20 transition-colors">
                    {t('settings.deleteButton')}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
