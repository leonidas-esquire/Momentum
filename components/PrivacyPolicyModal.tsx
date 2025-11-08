import React, { useContext } from 'react';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
    const { t } = useContext(LanguageContext)!;

    return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-2xl rounded-2xl border border-brand-secondary shadow-2xl flex flex-col animate-slide-in-up">
        <header className="p-6 border-b border-brand-secondary flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('privacyPolicy.title')}</h2>
            <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </header>

        <main className="p-6 md:p-8 space-y-4 text-brand-text-muted text-sm overflow-y-auto max-h-[70vh]">
            <p className="font-semibold text-brand-text">Last Updated: {new Date().toLocaleDateString()}</p>
            <p>Welcome to Momentum! Your privacy is critically important to us. This policy outlines how we handle your personal information.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">1. What Data We Collect</h3>
            <p>To provide you with a personalized experience, we collect:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Account Information:</strong> Your name and email address.</li>
                <li><strong>Habit & Identity Data:</strong> The habits you create, your chosen identities, and your completion history.</li>
                <li><strong>Social Data:</strong> Information related to your Squad or Team, such as memberships and chat messages.</li>
                <li><strong>Preferences:</strong> Your chosen language and AI voice preference.</li>
            </ul>

            <h3 className="text-lg font-semibold text-brand-text pt-2">2. How We Use Your Data</h3>
            <p>Your data is used exclusively to power the core features of the Momentum app, including:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Tracking your habit progress and streaks.</li>
                <li>Powering social features like Squads and Ripples.</li>
                <li>Generating personalized AI insights and missions to help you succeed.</li>
                <li>Customizing the app to your language and preferences.</li>
            </ul>
             <p className="font-semibold text-brand-text mt-2">We will never sell your personal data to third parties.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">3. Data Storage and Security</h3>
            <p>For this prototype version of the app, all of your data is stored locally on your device within your web browser's storage. It does not leave your device. In a future production version, data would be stored securely on encrypted servers.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">4. Your Rights (GDPR)</h3>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Access Your Data:</strong> All your data is visible to you within the app's dashboard.</li>
                <li><strong>Rectify Your Data:</strong> You can edit your name at any time.</li>
                <li><strong>Erasure ("Right to be Forgotten"):</strong> You can permanently delete your account and all associated data at any time via the Settings menu. This action is irreversible.</li>
            </ul>
             
            <h3 className="text-lg font-semibold text-brand-text pt-2">5. Consent</h3>
            <p>By creating an account on Momentum, you consent to the collection and use of your information as described in this policy.</p>

        </main>
        
        <footer className="p-6 border-t border-brand-secondary text-right">
            <button
                onClick={onClose}
                className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300"
            >
                {t('privacyPolicy.close')}
            </button>
        </footer>
      </div>
    </div>
  );
};