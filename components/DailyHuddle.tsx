import React, { useState, useEffect, useRef, useContext } from 'react';
import { DailyHuddleData, Habit } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface DailyHuddleProps {
  huddle: DailyHuddleData;
  mostImportantHabit: Habit;
  onEnergySelect: (energy: 'low' | 'medium' | 'high') => void;
}

export const DailyHuddle: React.FC<DailyHuddleProps> = ({ huddle, mostImportantHabit, onEnergySelect }) => {
  const [audioState, setAudioState] = useState<'loading' | 'playing' | 'idle' | 'error'>('loading');
  const [isMuted, setIsMuted] = useState(false);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { t } = useContext(LanguageContext)!;

  const playAudio = () => {
    if (!audioBufferRef.current || isMuted) return;
    if (!audioContextRef.current) {
      // Fix: Cast window to any to resolve TypeScript errors for vendor-prefixed webkitAudioContext, which is needed for older browser compatibility.
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setAudioState('idle');
    source.start(0);
    setAudioState('playing');
  };

  useEffect(() => {
    const initAudio = async () => {
      const audioData = await generateSpeech(huddle.greeting);
      if (audioData) {
        try {
          // Fix: Cast window to any to resolve TypeScript errors for vendor-prefixed webkitAudioContext, which is needed for older browser compatibility.
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          audioContextRef.current = ctx;
          const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
          audioBufferRef.current = buffer;
          playAudio();
        } catch (e) {
            console.error("Error decoding audio:", e);
            setAudioState('error');
        }
      } else {
        setAudioState('error');
      }
    };
    initAudio();

    return () => {
        audioContextRef.current?.close();
    }
  }, [huddle.greeting]);

  return (
    <div className="fixed inset-0 bg-brand-bg/95 backdrop-blur-lg z-50 flex flex-col justify-center items-center p-4 text-center animate-fade-in">
        <div className="w-full max-w-2xl">
            <div className="relative mb-8">
                <p className="text-3xl md:text-4xl font-semibold leading-tight">{huddle.greeting}</p>
                <div className="absolute -top-4 -right-4 flex gap-2">
                    <button onClick={playAudio} disabled={audioState === 'playing'} className="p-2 text-brand-text-muted hover:text-white disabled:opacity-50">
                        <Icon name="speaker-wave" className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-2 ${isMuted ? 'text-brand-primary' : 'text-brand-text-muted'} hover:text-white`}>
                        <Icon name={isMuted ? "speaker-x-mark" : "speaker-wave"} className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="bg-brand-surface border-2 border-brand-primary rounded-xl p-6 my-8">
                <h2 className="text-lg font-bold text-brand-primary uppercase tracking-wider mb-2">{t('dailyHuddle.oneThing')}</h2>
                <p className="text-2xl md:text-3xl font-bold">{mostImportantHabit.title}</p>
                <p className="text-brand-text-muted mt-1">{mostImportantHabit.description || mostImportantHabit.cue}</p>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">{t('dailyHuddle.energyQuestion')}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => onEnergySelect('low')} className="bg-brand-warning/10 border-2 border-brand-warning/20 text-brand-warning rounded-lg p-4 font-bold text-lg hover:bg-brand-warning/20 transition-colors">
                        {t('dailyHuddle.energyLow')}
                    </button>
                     <button onClick={() => onEnergySelect('medium')} className="bg-blue-500/10 border-2 border-blue-500/20 text-blue-400 rounded-lg p-4 font-bold text-lg hover:bg-blue-500/20 transition-colors">
                        {t('dailyHuddle.energyMedium')}
                    </button>
                     <button onClick={() => onEnergySelect('high')} className="bg-brand-safe/10 border-2 border-brand-safe/20 text-brand-safe rounded-lg p-4 font-bold text-lg hover:bg-brand-safe/20 transition-colors">
                        {t('dailyHuddle.energyHigh')}
                    </button>
                </div>
                <p className="text-xs text-brand-text-muted mt-3">{t('dailyHuddle.energyTip')}</p>
            </div>
        </div>
    </div>
  );
};
