import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob } from '@google/genai';
import { User, Habit } from '../types';
import { Icon } from './Icon';
import { encode, decode, decodeAudioData, createBlob } from '../utils/audio';

interface ChatbotProps {
  user: User;
  habits: Habit[];
  onClose: () => void;
}

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getHabitInfo',
    parameters: {
      type: Type.OBJECT,
      description: 'Get information about a specific habit, like its current streak or if it was completed today.',
      properties: {
        habitTitle: {
          type: Type.STRING,
          description: 'The title of the habit to look for. e.g., "Meditate for 5 minutes"',
        },
      },
      required: ['habitTitle'],
    },
  },
  {
    name: 'getPriorityHabit',
    parameters: {
      type: Type.OBJECT,
      description: 'Get the user\'s current priority habit.',
      properties: {},
    }
  }
];

export const Chatbot: React.FC<ChatbotProps> = ({ user, habits, onClose }) => {
  const [status, setStatus] = useState('Initializing...');
  const [transcript, setTranscript] = useState<{ user: string; model: string }[]>([]);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    let session: LiveSession;
    let inputAudioContext: AudioContext;
    let outputAudioContext: AudioContext;
    let stream: MediaStream;
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();
    
    const start = async () => {
      try {
        setStatus('Requesting mic permission...');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setStatus('Connecting to AI...');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Fix: Cast window to any to resolve TypeScript errors for vendor-prefixed webkitAudioContext, which is needed for older browser compatibility.
        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = inputAudioContext;
        
        sessionPromiseRef.current = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setStatus('Listening...');
              const source = inputAudioContext.createMediaStreamSource(stream);
              mediaStreamSourceRef.current = source;
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromiseRef.current?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                source.addEventListener('ended', () => sources.delete(source));
                source.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
                sources.add(source);
              }

              if (message.toolCall?.functionCalls) {
                for (const fc of message.toolCall.functionCalls) {
                  let result = 'Could not find that information.';
                  if (fc.name === 'getHabitInfo' && fc.args.habitTitle) {
                    const habit = habits.find(h => h.title.toLowerCase().includes(fc.args.habitTitle.toLowerCase()));
                    result = habit ? `The streak for "${habit.title}" is ${habit.streak} days.` : `I couldn't find a habit called "${fc.args.habitTitle}".`;
                  }
                  sessionPromiseRef.current?.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } }));
                }
              }
            },
            onerror: (e: ErrorEvent) => {
                console.error(e);
                setStatus('Connection error.');
            },
            onclose: () => {
                setStatus('Connection closed.');
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: user.voicePreference || 'Zephyr' } } },
            systemInstruction: `You are Momentum, a friendly AI assistant for this habit app. Your user is ${user.name}. Keep answers concise and encouraging.`,
            tools: [{ functionDeclarations }],
          }
        });

        session = await sessionPromiseRef.current;

      } catch (err) {
        console.error('Error starting chatbot:', err);
        setStatus('Failed to start. Please check permissions.');
      }
    };

    start();

    return () => {
        sessionPromiseRef.current?.then(session => session.close());
        stream?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        inputAudioContext?.close();
        outputAudioContext?.close();
    };
  }, [user, habits]);

  return (
    <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-lg flex flex-col items-center z-50 p-4 animate-fade-in">
        <button onClick={onClose} className="absolute top-6 right-6 text-brand-text-muted hover:text-white">
            <Icon name="close" className="w-8 h-8" />
        </button>

        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-bold">{status}</p>
            <p className="text-brand-text-muted mt-2">The AI is ready to assist you.</p>
        </div>

        <div className="flex flex-col items-center text-center pb-8">
             <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                <div className={`absolute inset-0 bg-brand-primary rounded-full ${status === 'Listening...' ? 'animate-ping' : ''} opacity-75`}></div>
                <div className="relative bg-brand-primary rounded-full p-6 text-white">
                    <Icon name="microphone" solid className="w-12 h-12" />
                </div>
            </div>
            <p className="text-sm text-brand-text-muted uppercase tracking-wider font-semibold">Voice Chat</p>
        </div>
    </div>
  );
};
