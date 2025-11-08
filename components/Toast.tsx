import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'danger' | 'warning';
}

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'danger' | 'warning';
  onClose: () => void;
}

const toastStyles = {
  success: {
    bg: 'bg-brand-safe/10 border-brand-safe/20',
    iconColor: 'text-brand-safe',
    icon: 'check',
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    icon: 'shield',
  },
  danger: {
    bg: 'bg-brand-danger/10 border-brand-danger/20',
    iconColor: 'text-brand-danger',
    icon: 'fire',
  },
  warning: {
    bg: 'bg-brand-warning/10 border-brand-warning/20',
    iconColor: 'text-brand-warning',
    icon: 'arrow-uturn-left',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const styles = toastStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(onClose, 300); // Wait for animation to finish
      return () => clearTimeout(exitTimer);
    }, 4700); // Start exit animation slightly before auto-close

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`flex items-start p-4 mb-4 rounded-lg shadow-lg border w-full animate-fade-in ${styles.bg} ${isExiting ? 'animate-fade-out' : ''}`}
      role="alert"
    >
      <div className={`flex-shrink-0 w-6 h-6 ${styles.iconColor}`}>
        <Icon name={styles.icon} solid={type === 'success'} />
      </div>
      <div className="ml-3 text-sm font-medium text-brand-text">
        {message}
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-brand-text-muted hover:text-white rounded-lg focus:ring-2 focus:ring-brand-secondary p-1.5 inline-flex items-center justify-center h-8 w-8"
        onClick={handleClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <Icon name="close" className="w-5 h-5" />
      </button>
    </div>
  );
};