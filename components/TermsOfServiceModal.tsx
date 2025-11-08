import React, { useContext } from 'react';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
    const { t } = useContext(LanguageContext)!;

    return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-2xl rounded-2xl border border-brand-secondary shadow-2xl flex flex-col animate-slide-in-up">
        <header className="p-6 border-b border-brand-secondary flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('termsOfService.title')}</h2>
            <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </header>

        <main className="p-6 md:p-8 space-y-4 text-brand-text-muted text-sm overflow-y-auto max-h-[70vh]">
            <p className="font-semibold text-brand-text">Last Updated: {new Date().toLocaleDateString()}</p>
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Momentum mobile application (the "Service") operated by us.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">1. Acceptance of Terms</h3>
            <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">2. Accounts</h3>
            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">3. User Conduct</h3>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Violate any local, state, national, or international law.</li>
                <li>Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, pornographic, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
                <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
            </ul>

            <h3 className="text-lg font-semibold text-brand-text pt-2">4. Termination</h3>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may do so through the Settings menu in the application.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">5. Limitation of Liability</h3>
            <p>In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h3 className="text-lg font-semibold text-brand-text pt-2">6. Changes to Terms</h3>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

        </main>
        
        <footer className="p-6 border-t border-brand-secondary text-right">
            <button
                onClick={onClose}
                className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300"
            >
                {t('termsOfService.close')}
            </button>
        </footer>
      </div>
    </div>
  );
};