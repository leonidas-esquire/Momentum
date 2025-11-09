import React, { useState } from 'react';
import { Icon } from './Icon';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';

interface LoginScreenProps {
  onStartOnboarding: (email: string) => void;
  onFounderLogin: () => void;
}

const FOUNDER_EMAIL = 'leonidas.esquire@gmail.com';
const FOUNDER_PASS = 'momentum$$357';

const LoginScreen: React.FC<LoginScreenProps> = ({ onStartOnboarding, onFounderLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setShowPassword(newEmail.toLowerCase() === FOUNDER_EMAIL);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showPassword) {
      // Founder Login Logic
      if (password === FOUNDER_PASS) {
        onFounderLogin();
      } else {
        setError('Invalid password for founder account.');
      }
    } else {
      // Regular User Onboarding
      onStartOnboarding(email);
    }
  };

  return (
    <>
      <div className="bg-brand-bg min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto text-center animate-fade-in">
          <Icon name="sparkles" className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Welcome to Momentum</h1>
          <p className="text-lg text-brand-text-muted mb-8">The start of your new identity awaits.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email to begin"
              className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none text-center"
              required
            />
            {showPassword && (
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Founder Password"
                className="w-full bg-brand-surface border border-brand-secondary rounded-lg p-4 text-brand-text placeholder-brand-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none text-center animate-fade-in"
                required
              />
            )}
            {error && <p className="text-sm text-brand-danger">{error}</p>}
            <button
              type="submit"
              disabled={!email}
              className="w-full bg-brand-primary text-white font-bold py-4 px-6 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-brand-secondary"
            >
              {showPassword ? 'Login' : 'Continue'} <Icon name="arrow-right" className="w-5 h-5" />
            </button>
          </form>

          <p className="text-xs text-brand-text-muted mt-6">
            By continuing, you agree to our<br />
            <button onClick={() => setShowTerms(true)} className="underline hover:text-brand-primary">Terms of Service</button> and 
            <button onClick={() => setShowPrivacy(true)} className="underline hover:text-brand-primary ml-1">Privacy Policy</button>.
          </p>
        </div>
      </div>
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfServiceModal onClose={() => setShowTerms(false)} />}
    </>
  );
};

export default LoginScreen;