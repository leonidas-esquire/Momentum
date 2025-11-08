import React, { useState, useRef, useEffect, useContext } from 'react';
import { User, ChatMessage } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface ChatInterfaceProps {
  user: User;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const HuddleMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const { t } = useContext(LanguageContext)!;
    return (
        <div className="bg-brand-bg border-2 border-dashed border-brand-primary/50 rounded-xl p-4 my-4">
            <div className="flex items-center gap-3 mb-2">
                <Icon name="sparkles" className="w-6 h-6 text-brand-primary" />
                <h3 className="text-lg font-bold text-brand-primary">{t('squadHub.huddle.title')}</h3>
            </div>
            <p className="text-brand-text-muted italic">"{message.text}"</p>
        </div>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t } = useContext(LanguageContext)!;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[400px]">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {messages.map((msg) => {
                    if (msg.isHuddleMessage) {
                        return <HuddleMessage key={msg.id} message={msg} />;
                    }

                    const isCurrentUser = msg.userId === user.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && (
                                <div className="w-8 h-8 rounded-full bg-brand-secondary flex-shrink-0 flex items-center justify-center font-bold">
                                    {msg.userName.charAt(0)}
                                </div>
                            )}
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isCurrentUser ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-bg text-brand-text rounded-bl-none'}`}>
                                {!isCurrentUser && <p className="font-bold text-xs text-brand-primary mb-1">{msg.userName}</p>}
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('squadHub.chatPlaceholder')}
                    className="w-full bg-brand-bg border border-brand-secondary rounded-full p-3 px-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <button type="submit" className="bg-brand-primary text-white rounded-full p-3 flex-shrink-0 hover:bg-opacity-80 transition-colors">
                    <Icon name="arrow-right" className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};