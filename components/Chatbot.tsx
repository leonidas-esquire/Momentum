import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { User, Habit, DailyHuddleData } from '../types';
import { Icon } from './Icon';
import { createBlob, decode, decodeAudioData } from '../utils/audio';
import { LanguageContext } from '../contexts/LanguageContext';

type ChatbotMode = 'general' | 'huddle';

interface ChatbotProps {
  user: User;
  habits: Habit[];
  onClose: () => void;
  mode?: ChatbotMode;
  huddleData?: DailyHuddleData;
  onHuddleComplete?: (energy: 'low' | 'medium' | 'high') => void;
}

interface ConversationTurn {
    speaker: 'user' | 'model';
    text: string;
}

const setEnergyLevelFunctionDeclaration: FunctionDeclaration = {
    name: 'setEnergyLevel',
    parameters: {
        type: Type.OBJECT,
        description: 'Sets the user\'s declared energy level for the day to lock in their focus.',
        properties: {
            energy: {
                type: Type.STRING,
                description: 'The user\'s energy level. Must be one of "low", "medium", or "high".',
            },
        },
        required: ['energy'],
    },
};

export const Chatbot: React.FC<ChatbotProps> = ({ user, habits, onClose, mode = 'general', huddleData, onHuddleComplete }) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [currentModelOutput, setCurrentModelOutput] = useState('');
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const { t } = useContext(LanguageContext)!;

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [conversationHistory, currentUserInput, currentModelOutput]);

  useEffect(() => {
    let inputAudioContext: AudioContext;
    let outputAudioContext: AudioContext;
    let stream: MediaStream;
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();
    
    let currentInputTranscription = '';
    let currentOutputTranscription = '';

    const start = async () => {
      try {
        setStatus('connecting');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        let systemInstruction = `You are Momentum, a friendly AI assistant for this habit app. Your user is ${user.name}. Keep answers concise and encouraging. Today is ${new Date().toDateString()}`;
        let initialMessages: ConversationTurn[] = [];
        // Fix: The `tools` property expects an array of tool objects. The type has been corrected to reflect this.
        let tools: { functionDeclarations: FunctionDeclaration[] }[] | undefined = undefined;

        if (mode === 'huddle' && huddleData) {
            const mostImportantHabit = habits.find(h => h.id === huddleData.mostImportantHabitId);
            systemInstruction = `You are leading a motivational Daily Huddle. Your user is ${user.name}. Start by delivering the provided greeting. Your primary goal is to have a brief, encouraging conversation and determine the user's energy level for the day. Once you know their energy level (low, medium, or high), you MUST call the setEnergyLevel function. Do not end the conversation until the function is called. Keep the conversation focused on today's main habit: "${mostImportantHabit?.title}".`;
            initialMessages = [{ speaker: 'model', text: huddleData.greeting }];
            tools = [{ functionDeclarations: [setEnergyLevelFunctionDeclaration] }];
        }
        setConversationHistory(initialMessages);

        sessionPromiseRef.current = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setStatus('listening');
              const source = inputAudioContext.createMediaStreamSource(stream);
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
                setStatus('speaking');
                const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const sourceNode = outputAudioContext.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outputAudioContext.destination);
                sourceNode.addEventListener('ended', () => {
                    sources.delete(sourceNode);
                    if (sources.size === 0) setStatus('listening');
                });
                sourceNode.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
                sources.add(sourceNode);
              }
              
              if (message.serverContent?.inputTranscription) {
                currentInputTranscription += message.serverContent.inputTranscription.text;
                setCurrentUserInput(currentInputTranscription);
              } else if (message.serverContent?.outputTranscription) {
                 currentOutputTranscription += message.serverContent.outputTranscription.text;
                 setCurrentModelOutput(currentOutputTranscription);
              }

              if (message.serverContent?.turnComplete) {
                if (currentInputTranscription.trim()) {
                    setConversationHistory(prev => [...prev, { speaker: 'user', text: currentInputTranscription.trim() }]);
                }
                if (currentOutputTranscription.trim()) {
                    setConversationHistory(prev => [...prev, { speaker: 'model', text: currentOutputTranscription.trim() }]);
                }
                currentInputTranscription = '';
                currentOutputTranscription = '';
                setCurrentUserInput('');
                setCurrentModelOutput('');
              }
              
              if (message.toolCall?.functionCalls) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === 'setEnergyLevel' && onHuddleComplete) {
                    const energy = fc.args.energy as 'low' | 'medium' | 'high';
                    if (['low', 'medium', 'high'].includes(energy)) {
                      onHuddleComplete(energy);
                      // Don't send a tool response, as this concludes the interaction
                    }
                  }
                }
              }
            },
            onerror: (e: ErrorEvent) => {
                console.error(e);
                setStatus('error');
            },
            onclose: () => {},
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: user.voicePreference || 'Zephyr' } } },
            systemInstruction,
            tools,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          }
        });
        await sessionPromiseRef.current;
      } catch (err) {
        console.error('Error starting chatbot:', err);
        setStatus('error');
      }
    };

    start();

    return () => {
      sessionPromiseRef.current?.then(session => session.close());
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      scriptProcessorRef.current?.disconnect();
      inputAudioContext?.close();
      outputAudioContext?.close();
    };
  }, [user, habits]);

  const getStatusText = () => {
    switch(status) {
        case 'connecting': return 'Connecting...';
        case 'listening': return 'Listening...';
        case 'speaking': return 'Speaking...';
        case 'error': return 'Connection error. Please try again.';
        default: return 'Initializing...';
    }
  }

  const headerText = mode === 'huddle' ? t('dailyHuddle.oneThing') : 'Momentum AI';

  return (
    <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-lg flex flex-col justify-between items-center z-50 p-4 animate-fade-in">
      <header className="w-full max-w-2xl flex justify-between items-center pt-2">
        <h2 className="text-xl font-bold">{headerText}</h2>
        <button onClick={onClose} className="text-brand-text-muted hover:text-white">
          <Icon name="close" className="w-8 h-8" />
        </button>
      </header>
      
      <main ref={historyRef} className="w-full max-w-2xl flex-grow overflow-y-auto my-4 space-y-4 pr-2">
        {conversationHistory.map((turn, index) => (
          <div key={index} className={`flex flex-col ${turn.speaker === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${turn.speaker === 'user' ? 'bg-brand-primary rounded-br-none' : 'bg-brand-surface rounded-bl-none'}`}>
              <p>{turn.text}</p>
            </div>
          </div>
        ))}
        {currentUserInput && (
           <div className="flex flex-col items-end">
            <div className="rounded-2xl px-4 py-2 max-w-[80%] bg-brand-primary/50 rounded-br-none">
              <p className="italic">{currentUserInput}</p>
            </div>
          </div>
        )}
        {currentModelOutput && (
           <div className="flex flex-col items-start">
            <div className="rounded-2xl px-4 py-2 max-w-[80%] bg-brand-surface/50 rounded-bl-none">
              <p className="italic">{currentModelOutput}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full flex flex-col items-center text-center pb-8">
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <div className={`absolute inset-0 bg-brand-primary rounded-full transition-transform duration-200 ${status === 'listening' ? 'scale-100 animate-pulse' : 'scale-75'} ${status === 'speaking' ? 'scale-90' : ''}`}></div>
          <div className="relative bg-brand-surface rounded-full p-6 text-white shadow-lg">
            <Icon name="microphone" solid className="w-8 h-8 text-brand-text" />
          </div>
        </div>
        <p className="text-lg font-semibold text-brand-text-muted">{getStatusText()}</p>
      </footer>
    </div>
  );
};
