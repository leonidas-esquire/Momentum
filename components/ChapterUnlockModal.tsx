import React from 'react';
import { Icon } from './Icon';
import { UserIdentity } from '../types';

interface ChapterUnlockModalProps {
  identity: UserIdentity;
  newChapter: { number: number; title: string; lore: string };
  onClose: () => void;
}

export const ChapterUnlockModal: React.FC<ChapterUnlockModalProps> = ({ identity, newChapter, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-md rounded-2xl border-2 border-brand-primary/50 shadow-2xl p-6 md:p-8 animate-slide-in-up text-center">
        <div className="w-20 h-20 bg-brand-primary/10 border-4 border-brand-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
          <Icon name="book-open" className="w-12 h-12 text-brand-primary" />
        </div>
        
        <p className="font-bold text-brand-primary mb-2">CHAPTER UNLOCKED</p>
        <h2 className="text-3xl font-bold mb-4">{identity.name}: Chapter {newChapter.number}</h2>
        <h3 className="text-xl font-semibold text-brand-text-muted mb-6">"{newChapter.title}"</h3>

        <div className="bg-brand-bg text-left p-4 rounded-lg mb-8">
          <p className="text-brand-text-muted italic">"{newChapter.lore}"</p>
        </div>
        
        <button
          onClick={onClose}
          className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300"
        >
          Continue Your Journey
        </button>
      </div>
    </div>
  );
};
