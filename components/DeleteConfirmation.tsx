import React from 'react';
import { Icon } from './Icon';

interface DeleteConfirmationProps {
  habitTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ habitTitle, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-md rounded-2xl border-2 border-brand-danger shadow-2xl p-6 md:p-8 animate-slide-in-up text-center">
        <div className="w-16 h-16 bg-brand-danger/10 border-4 border-brand-danger/20 rounded-full mx-auto flex items-center justify-center mb-4">
          <Icon name="trash" className="w-8 h-8 text-brand-danger" />
        </div>
        
        <h2 className="text-2xl font-bold text-brand-danger mb-4">Are You Absolutely Sure?</h2>
        <p className="text-brand-text-muted mb-2">You are about to delete the habit:</p>
        <p className="font-bold text-lg mb-6">"{habitTitle}"</p>
        
        <div className="bg-brand-danger/10 border-l-4 border-brand-danger text-brand-danger p-4 rounded-md text-left mb-8">
          <p className="font-semibold">This action is irreversible.</p>
          <p>Deleting this habit will permanently erase its history and you will lose all the momentum you've built.</p>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-brand-secondary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300"
          >
            Keep My Momentum
          </button>
          <button
            onClick={onConfirm}
            className="bg-brand-danger text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2"
          >
            Yes, Delete It
          </button>
        </div>
      </div>
    </div>
  );
};