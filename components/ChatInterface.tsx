import React, { useState, useEffect, useRef, useContext } from 'react';
import { ChatMessage, User } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    currentUser: User;
    isProUser: boolean;
    onSendMessage: (text: string) => void;
    onTriggerUpgrade: (reason: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, currentUser, isProUser, onSendMessage, onTriggerUpgrade }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});
    const { t } = useContext(LanguageContext)!;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };
    
    const toggleShowOriginal = (messageId: string) => {
        setShowOriginal(prev => ({ ...prev, [messageId]: !prev[messageId] }));
    };

    return (
        <div className="flex flex-col h-96 bg-brand-bg rounded-lg">
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-brand-text-muted">
                        <p>{t('squadHub.noMessages')}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSentByCurrentUser = msg.fromUserName === currentUser.name;
                        const isTranslated = msg.originalLanguage !== currentUser.language;
                        const translation = msg.translations[currentUser.language];
                        const shouldShowOriginal = showOriginal[msg.id];

                        let displayText: React.ReactNode = msg.originalText;

                        if (isTranslated && !shouldShowOriginal) {
                             if (translation === 'LIMIT_REACHED') {
                                displayText = (
                                    <span className="italic text-brand-text-muted">
                                        {t('squadHub.chatTranslationLimit')}
                                        <button onClick={() => onTriggerUpgrade('translation')} className="text-yellow-400 font-semibold hover:underline ml-1">
                                            {t('squadHub.upgrade')}
                                        </button>
                                    </span>
                                );
                             } else {
                                displayText = translation || <span className="italic text-brand-text-muted">{t('squadHub.chatTranslating')}</span>;
                             }
                        }

                        return (
                            <div key={msg.id} className={`flex flex-col ${isSentByCurrentUser ? 'items-end' : 'items-start'}`}>
                                {!isSentByCurrentUser && (
                                    <span className="text-xs text-brand-text-muted ml-3 mb-1">{msg.fromUserName.split(' ')[0]}</span>
                                )}
                                <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${isSentByCurrentUser ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-surface rounded-bl-none text-brand-text'}`}>
                                    <p>{displayText}</p>
                                </div>
                                {isTranslated && translation && translation !== 'LIMIT_REACHED' && (
                                     <button onClick={() => toggleShowOriginal(msg.id)} className="text-xs text-brand-text-muted hover:underline mt-1 px-3">
                                        {shouldShowOriginal ? t('squadHub.chatShowTranslation') : t('squadHub.chatShowOriginal')}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-brand-secondary flex items-center gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('squadHub.chatPlaceholder')}
                    className="w-full bg-brand-surface border border-brand-secondary rounded-full py-2 px-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <button
                    type="submit"
                    className="bg-brand-primary text-white font-bold p-3 rounded-full hover:bg-opacity-80 transition-colors duration-300 flex-shrink-0"
                    aria-label={t('squadHub.chatSend')}
                >
                    <Icon name="arrow-right" className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};