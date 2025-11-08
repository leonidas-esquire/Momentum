import React, { useState } from 'react';
import { User } from '../types';
import { Icon } from './Icon';

interface SquadBuilderProps {
  user: User;
  onCreateSquad: (name: string, goalIdentity: string) => void;
  onClose: () => void;
}

export const SquadBuilder: React.FC<SquadBuilderProps> = ({ user, onCreateSquad, onClose }) => {
  const [name, setName] = useState('');
  const [goalIdentity, setGoalIdentity] = useState(user.selectedIdentities[0]?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && goalIdentity.trim()) {
      onCreateSquad(name, goalIdentity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-brand-secondary shadow-2xl p-6 md:p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Form Your Squad</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-white">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">Squad Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Creators"
              className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none"
              required
            />
            <p className="text-xs text-brand-text-muted mt-1">Squads have a maximum of 5 members.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">Shared Goal Identity</label>
            <select
              value={goalIdentity}
              onChange={(e) => setGoalIdentity(e.target.value)}
              className="w-full bg-brand-bg border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
              required
            >
              {user.selectedIdentities.map(id => (
                <option key={id.id} value={id.name}>{id.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">Invite Members (Coming Soon)</label>
            <div className="w-full bg-brand-bg border border-dashed border-brand-secondary rounded-lg p-3 text-brand-text-muted">
                Invite by link will be available soon. For now, create the squad and have friends join later.
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!name.trim()}
              className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 disabled:bg-brand-secondary"
            >
              Create Squad <Icon name="plus" className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};