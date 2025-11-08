import React, { useState, useEffect, useContext } from 'react';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';
import { generateAssistMessages } from '../services/geminiService';

interface OfferAssistModalProps {
  requesterName: string;
  requesterIdentity: string;
  habitTitle: string;
  onClose: () => void;
  onSendAssist: (message: string) => void;
}

export const OfferAssistModal: React.FC<OfferAssistModalProps> = ({ requesterName, requesterIdentity, habitTitle, onClose, onSendAssist }) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [customMessage, setCustomMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { language, t } = useContext(LanguageContext)!;

    useEffect(() => {
        generateAssistMessages(requesterName, requesterIdentity, habitTitle, language)
            .then(setMessages)
            .finally(() => setIsLoading(false));
    }, [requesterName, requesterIdentity, habitTitle, language]);

    const handleSend = (message: string) => {
        if (message.trim()) {
            onSendAssist(message.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('dashboard.assist.modalTitle', { name: requesterName })}</h2>
                    <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
                </div>
                <p className="text-brand-text-muted mb-6">{t('dashboard.assist.modalSubtitle')}</p>

                {isLoading ? (
                    <div className="text-center text-brand-text-muted space-y-2">
                        <Icon name="sparkles" className="w-8 h-8 mx-auto animate-pulse mb-2 text-brand-primary" />
                        <p>{t('dashboard.assist.loading')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(msg)}
                                className="w-full bg-brand-bg border border-brand-secondary text-brand-text font-semibold p-3 rounded-lg text-left hover:border-brand-primary hover:bg-brand-primary/10 transition-colors duration-200"
                            >
                                {msg}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="mt-6">
                    <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder={t('dashboard.assist.customPlaceholder')}
                        className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        rows={2}
                    />
                    <button
                        onClick={() => handleSend(customMessage)}
                        disabled={!customMessage.trim()}
                        className="w-full mt-3 bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 disabled:bg-brand-secondary"
                    >
                        {t('dashboard.assist.sendButton')}
                    </button>
                </div>

            </div>
        </div>
    );
};
