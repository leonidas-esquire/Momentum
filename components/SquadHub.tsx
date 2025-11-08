import React, { useState, useEffect, useContext, useRef } from 'react';
import { Squad, Ripple, User, JoinRequest, KickVote, Nudge, SquadQuest, ChatMessage, SharedWin } from '../types';
import { Icon } from './Icon';
import { generateSquadInsight, generateSquadRecruitmentMessage } from '../services/geminiService';
import { findMatchingSquads, SQUAD_MEMBER_LIMIT } from '../services/squadService';
import { LanguageContext } from '../contexts/LanguageContext';
import { SquadQuestCard } from './SquadQuestCard';
import { ChatInterface } from './ChatInterface';

interface SquadHubProps {
  user: User;
  isProUser: boolean;
  squad: Squad | null;
  allSquads: Squad[];
  ripples: Ripple[];
  chatMessages: ChatMessage[];
  onOpenSquadBuilder: () => void;
  onOpenInviteModal: () => void;
  onOpenRequestModal: (squad: Squad) => void;
  onVoteOnRequest: (squadId: string, requestUserName: string, vote: 'approve' | 'deny') => void;
  onVoteToKick: (squadId: string, targetUserName: string) => void;
  onNudge: (rippleId: string, message: string) => void;
  onCompleteQuest: (squadId: string, questId: string) => void;
  onSendChatMessage: (squadId: string, text: string) => void;
  onTriggerUpgrade: (reason: string) => void;
}

const NUDGE_OPTIONS = ["On fire! 🔥", "Inspiring ✨", "Momentum! 🚀", "Great work! 💪"];

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NudgeSelector: React.FC<{
    onSelect: (message: string) => void;
    onClose: () => void;
}> = ({ onSelect, onClose }) => {
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={selectorRef} className="absolute right-0 bottom-full mb-2 bg-brand-bg border border-brand-secondary rounded-full shadow-lg z-10 p-1 flex items-center gap-1 animate-fade-in">
            {NUDGE_OPTIONS.map(option => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className="p-2 rounded-full hover:bg-brand-primary/20 transition-colors duration-200 text-xl"
                    title={option.split('!')[0]}
                >
                    {option.split(' ')[1]}
                </button>
            ))}
        </div>
    );
};


const RippleItem: React.FC<{ ripple: Ripple; currentUser: User; onNudge: (rippleId: string, message: string) => void; }> = ({ ripple, currentUser, onNudge }) => {
  const [showNudgeSelector, setShowNudgeSelector] = useState(false);
  
  const handleNudgeSelect = (message: string) => {
      onNudge(ripple.id, message);
      setShowNudgeSelector(false);
  }

  const hasNudged = ripple.nudges.some(n => n.fromUserName === currentUser.name);

  return (
    <div className="flex flex-col gap-3 p-3 bg-brand-bg/50 rounded-lg animate-fade-in">
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${ripple.isQuestCompletion ? 'bg-yellow-400/20' : 'bg-brand-primary/20'}`}>
                <Icon name={ripple.isQuestCompletion ? "trophy" : "sparkles"} className={`w-5 h-5 ${ripple.isQuestCompletion ? 'text-yellow-400' : 'text-brand-primary'}`} />
            </div>
            <div className="flex-grow">
                 <p className="text-brand-text text-sm">
                    <span className="font-bold">{ripple.fromUserName}</span> 
                    {ripple.isQuestCompletion ? ' completed the quest ' : ' completed '} 
                    <span className={`font-semibold ${ripple.isQuestCompletion ? 'text-yellow-400' : 'text-brand-primary'}`}>"{ripple.habitTitle}"</span>
                    {ripple.isQuestCompletion && <span className="font-bold text-brand-safe"> +{ripple.questPoints} Momentum!</span>}
                </p>
                <p className="text-xs text-brand-text-muted">{timeAgo(ripple.timestamp)} &middot; {ripple.identityTag} Momentum</p>
            </div>
            {ripple.fromUserName !== currentUser.name && !ripple.isQuestCompletion && (
                <div className="relative">
                    <button 
                        onClick={() => setShowNudgeSelector(s => !s)}
                        disabled={hasNudged}
                        className={`p-2 rounded-full transition-colors duration-200 ${hasNudged ? 'text-brand-primary' : 'text-brand-text-muted hover:bg-brand-surface'}`}
                    >
                        <Icon name="sparkles" className="w-5 h-5"/>
                    </button>
                    {showNudgeSelector && <NudgeSelector onSelect={handleNudgeSelect} onClose={() => setShowNudgeSelector(false)} />}
                </div>
            )}
        </div>
        {ripple.nudges.length > 0 && (
            <div className="pl-11 flex flex-wrap gap-2">
                {ripple.nudges.map((nudge, index) => (
                    <div key={index} title={`${nudge.message} from ${nudge.fromUserName}`} className="bg-brand-surface px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <span>{nudge.message.split(' ')[1]}</span>
                        <span className="font-semibold">{nudge.fromUserName.split(' ')[0]}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}

const SharedWinCard: React.FC<{ win: SharedWin }> = ({ win }) => {
    const { t } = useContext(LanguageContext)!;
    const moodEmojiMap = {
        terrible: '😫',
        bad: '😐',
        okay: '😊',
        good: '😄',
        great: '🚀'
    };
    return (
        <div className="bg-brand-bg/50 p-4 rounded-lg animate-fade-in">
            <div className="flex justify-between items-start">
                <p className="font-bold text-brand-text">{win.fromUserName}</p>
                <span className="text-xs text-brand-text-muted">{timeAgo(win.timestamp)}</span>
            </div>
            <div className="flex items-start gap-3 mt-2">
                <span className="text-2xl mt-1">{moodEmojiMap[win.mood]}</span>
                <p className="text-brand-text-muted italic border-l-2 border-brand-secondary pl-3">"{win.message}"</p>
            </div>
        </div>
    );
};

const SquadSuggestionCard: React.FC<{ squad: Squad; onRequest: (squad: Squad) => void; }> = ({ squad, onRequest }) => {
    const { t } = useContext(LanguageContext)!;
    const isFull = squad.members.length >= SQUAD_MEMBER_LIMIT;
    return (
        <div className="bg-brand-bg p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-bold">{squad.name}</p>
                <p className="text-sm text-brand-text-muted">Goal: {squad.goalIdentity} &middot; {squad.members.length} / {SQUAD_MEMBER_LIMIT} members</p>
            </div>
            <button
                onClick={() => onRequest(squad)}
                disabled={isFull}
                className="bg-brand-primary text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-opacity-80 transition-colors duration-300 flex-shrink-0 disabled:bg-brand-secondary disabled:cursor-not-allowed"
            >
                {isFull ? t('squadHub.joinFull') : t('squadHub.joinRequest')}
            </button>
        </div>
    );
};

const PendingRequestCard: React.FC<{
    request: JoinRequest;
    squad: Squad;
    onVote: (squadId: string, requestUserName: string, vote: 'approve' | 'deny') => void;
}> = ({ request, squad, onVote }) => {
    const { t } = useContext(LanguageContext)!;
    const isFull = squad.members.length >= SQUAD_MEMBER_LIMIT;
    return (
        <div className="bg-brand-bg p-4 rounded-lg">
            <p className="font-bold text-brand-text mb-2">{t('squadHub.wantsToJoin', { name: request.userName })}</p>
            <p className="text-sm text-brand-text-muted border-l-2 border-brand-secondary pl-3 mb-4 italic">"{request.pitch}"</p>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-primary">{t('squadHub.approvals', { count: request.approvals.length })}</span>
                <div className="flex gap-2">
                    <button onClick={() => onVote(squad.id, request.userName, 'deny')} className="bg-brand-danger/20 text-brand-danger font-bold py-1 px-3 rounded-full text-sm hover:bg-brand-danger/40">{t('squadHub.deny')}</button>
                    <button
                        onClick={() => onVote(squad.id, request.userName, 'approve')}
                        disabled={isFull}
                        title={isFull ? t('squadHub.approveDisabled') : "Approve this request"}
                        className="bg-brand-safe/20 text-brand-safe font-bold py-1 px-3 rounded-full text-sm hover:bg-brand-safe/40 disabled:bg-brand-secondary/20 disabled:text-brand-text-muted disabled:cursor-not-allowed"
                    >
                        {t('squadHub.approve')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SquadMemberItem: React.FC<{
    memberName: string;
    isCurrentUser: boolean;
    squad: Squad;
    onVoteToKick: (squadId: string, targetUserName: string) => void;
}> = ({ memberName, isCurrentUser, squad, onVoteToKick }) => {
    const { t } = useContext(LanguageContext)!;
    const kickVote = squad.activeKickVotes.find(kv => kv.targetUserName === memberName);
    const requiredVotes = Math.ceil(squad.members.length * 0.5);

    return (
        <div className="bg-brand-bg/50 p-3 rounded-lg flex items-center justify-between">
            <p className={`font-semibold ${isCurrentUser ? 'text-brand-primary' : 'text-brand-text'}`}>{memberName} {isCurrentUser && t('squadHub.you')}</p>
            {!isCurrentUser && (
                kickVote ? (
                    <div className="text-right">
                        <p className="text-sm font-semibold text-brand-warning">{t('squadHub.kickVote', { voters: kickVote.voters.length, required: requiredVotes })}</p>
                        {!kickVote.voters.includes(squad.members.find(m => m !== memberName) || '') && (
                             <button onClick={() => onVoteToKick(squad.id, memberName)} className="text-xs text-brand-warning hover:underline">{t('squadHub.voteToRemove')}</button>
                        )}
                    </div>
                ) : (
                    <button onClick={() => onVoteToKick(squad.id, memberName)} className="text-sm text-brand-text-muted hover:text-brand-danger font-semibold">
                        {t('squadHub.voteToKick')}
                    </button>
                )
            )}
        </div>
    );
};

export const SquadHub: React.FC<SquadHubProps> = ({ user, isProUser, squad, allSquads, ripples, chatMessages, onOpenSquadBuilder, onOpenInviteModal, onOpenRequestModal, onVoteOnRequest, onVoteToKick, onNudge, onCompleteQuest, onSendChatMessage, onTriggerUpgrade }) => {
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'chat' | 'quests' | 'wins' | 'leaderboard' | 'members'>('activity');
  const [recruitmentMessage, setRecruitmentMessage] = useState('');
  const [isLoadingRecruitment, setIsLoadingRecruitment] = useState(false);
  const [suggestedSquads, setSuggestedSquads] = useState<Squad[]>([]);
  const { language, t } = useContext(LanguageContext)!;

  useEffect(() => {
    if (!squad && user && (user.openToSquadSuggestions ?? true)) {
        setIsLoadingRecruitment(true);
        generateSquadRecruitmentMessage(user.name, user.selectedIdentities, language)
            .then(message => setRecruitmentMessage(message))
            .finally(() => setIsLoadingRecruitment(false));
        
        const suggestions = findMatchingSquads(user, allSquads);
        setSuggestedSquads(suggestions);
    }
  }, [squad, user, allSquads, language]);

  const handleGetInsight = async () => {
    if (!squad) return;
    setIsLoadingInsight(true);
    const activitySummary = ripples
      .slice(0, 5)
      .map(r => `${r.fromUserName} completed "${r.habitTitle}"`)
      .join('; ');
    
    const insight = await generateSquadInsight(squad.name, activitySummary, language);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  const sortedSquads = [...allSquads].sort((a, b) => b.sharedMomentum - a.sharedMomentum);

  if (!squad) {
    return (
      <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
        <div className="text-center">
            <Icon name="users" className="w-12 h-12 mx-auto text-brand-text-muted mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('dashboard.squadHub.title')}</h2>
            {isLoadingRecruitment ? (
            <div className="h-10 w-3/4 mx-auto bg-brand-bg rounded-md animate-pulse my-4"></div>
            ) : (
            <p className="text-brand-text-muted mb-6 max-w-xl mx-auto">{recruitmentMessage || t('dashboard.squadHub.noSquadMessage')}</p>
            )}
        </div>

        {suggestedSquads.length > 0 && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-center mb-4">{t('dashboard.squadHub.suggestedSquads')}</h3>
                <div className="max-w-md mx-auto space-y-3">
                    {suggestedSquads.map(s => (
                        <SquadSuggestionCard key={s.id} squad={s} onRequest={onOpenRequestModal} />
                    ))}
                </div>
                 <p className="text-center text-brand-text-muted my-4">{t('dashboard.squadHub.or')}</p>
            </div>
        )}
       
        <div className="flex justify-center">
             <button onClick={onOpenSquadBuilder} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full text-base hover:bg-opacity-80 transition-colors duration-300 flex items-center gap-2 mx-auto">
                <Icon name="plus" className="w-5 h-5" /> {t('dashboard.squadHub.formSquad')}
            </button>
        </div>
      </div>
    );
  }

  const squadMessages = chatMessages.filter(m => m.squadId === squad.id);

  return (
    <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6">
        <div className="md:flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3"><Icon name="users" className="w-6 h-6" />{squad.name}</h2>
                <p className="text-brand-text-muted">Pursuing The {squad.goalIdentity}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="text-center">
                    <p className="text-4xl font-bold text-brand-primary">{squad.sharedMomentum.toLocaleString()}</p>
                    <p className="text-sm text-brand-text-muted">{t('squadHub.sharedMomentum')}</p>
                </div>
                <button onClick={onOpenInviteModal} className="bg-brand-primary/20 text-brand-primary font-bold py-3 px-4 rounded-full text-sm hover:bg-brand-primary/40 transition-colors duration-300 flex items-center gap-2">
                    <Icon name="user-plus" className="w-5 h-5" /> {t('squadHub.invite')}
                </button>
            </div>
        </div>

        {squad.pendingRequests.length > 0 && (
            <div className="my-6 border-t border-b border-brand-secondary py-4">
                <h3 className="font-semibold mb-2 text-yellow-400">{t('squadHub.pendingRequests', { count: squad.pendingRequests.length })}</h3>
                <div className="space-y-3">
                    {squad.pendingRequests.map(req => (
                        <PendingRequestCard key={req.userName} request={req} squad={squad} onVote={onVoteOnRequest} />
                    ))}
                </div>
            </div>
        )}
      
        <div className="flex border-b border-brand-secondary mb-4 overflow-x-auto">
            <button onClick={() => setActiveTab('activity')} className={`py-2 px-4 font-semibold transition-colors duration-200 flex-shrink-0 ${activeTab === 'activity' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}>{t('squadHub.tabActivity')}</button>
            <button onClick={() => setActiveTab('chat')} className={`py-2 px-4 font-semibold transition-colors duration-200 flex-shrink-0 ${activeTab === 'chat' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}>{t('squadHub.tabChat')}</button>
            <button onClick={() => setActiveTab('wins')} className={`py-2 px-4 font-semibold transition-colors duration-200 flex-shrink-0 ${activeTab === 'wins' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}>{t('squadHub.tabWins')}</button>
            <button onClick={() => setActiveTab('quests')} className={`py-2 px-4 font-semibold transition-colors duration-200 flex-shrink-0 ${activeTab === 'quests' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}>{t('squadHub.tabQuests')}</button>
            <button onClick={() => setActiveTab('leaderboard')} className={`py-2 px-4 font-semibold transition-colors duration-200 flex-shrink-0 ${activeTab === 'leaderboard' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}>{t('squadHub.tabLeaderboard')}</button>
            <button onClick={() => setActiveTab('members')} className={`py-2 px-4 font-semibold transition-colors duration-200 flex-shrink-0 ${activeTab === 'members' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}>{t('squadHub.tabMembers', { count: squad.members.length })}</button>
        </div>

        {activeTab === 'activity' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
                <div>
                    <h3 className="font-semibold mb-2">{t('squadHub.tabActivity')}</h3>
                    <div className="space-y-3 bg-brand-bg p-3 rounded-lg max-h-80 overflow-y-auto">
                        {ripples.length > 0 ? (
                            ripples.map(ripple => <RippleItem key={ripple.id} ripple={ripple} currentUser={user} onNudge={onNudge} />)
                        ) : (
                            <p className="text-sm text-brand-text-muted text-center p-4">{t('squadHub.noRipples')}</p>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">{t('squadHub.aiCoachTitle')}</h3>
                    <div className="bg-brand-bg p-4 rounded-lg min-h-[120px] flex items-center justify-center">
                        {isLoadingInsight ? (
                            <div className="text-brand-text-muted">{t('squadHub.aiCoachLoading')}</div>
                        ) : aiInsight ? (
                            <p className="text-center text-brand-text italic text-sm">"{aiInsight}"</p>
                        ) : (
                            <button onClick={handleGetInsight} className="bg-brand-primary/20 text-brand-primary font-bold py-2 px-4 rounded-full text-sm hover:bg-brand-primary/40 transition-colors duration-300 flex items-center gap-2">
                                <Icon name="sparkles" className="w-4 h-4" /> {t('squadHub.aiCoachButton')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === 'chat' && (
             <div className="animate-fade-in">
                <ChatInterface 
                    messages={squadMessages} 
                    currentUser={user} 
                    isProUser={isProUser}
                    onSendMessage={(text) => onSendChatMessage(squad.id, text)}
                    onTriggerUpgrade={onTriggerUpgrade}
                />
            </div>
        )}
        
        {activeTab === 'wins' && (
            <div className="animate-fade-in">
                 <h3 className="font-semibold mb-2">{t('squadHub.winsTitle')}</h3>
                 <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {(squad.sharedWins && squad.sharedWins.length > 0) ? (
                        squad.sharedWins.map(win => <SharedWinCard key={win.id} win={win} />)
                    ) : (
                        <p className="text-sm text-brand-text-muted text-center p-4">{t('squadHub.noWins')}</p>
                    )}
                 </div>
            </div>
        )}

        {activeTab === 'quests' && (
             <div className="animate-fade-in">
                <h3 className="font-semibold mb-2">{t('squadHub.questsTitle')}</h3>
                <div className="space-y-3">
                    {!squad.dailyQuests ? (
                        <div className="text-center p-4 bg-brand-bg rounded-lg">
                            <Icon name="sparkles" className="w-8 h-8 mx-auto text-brand-primary animate-pulse mb-2" />
                            <p className="text-brand-text-muted">{t('squadHub.questsLoading')}</p>
                        </div>
                    ) : (
                        squad.dailyQuests.quests.map(quest => (
                            <SquadQuestCard
                                key={quest.id}
                                quest={quest}
                                onComplete={() => onCompleteQuest(squad.id, quest.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'leaderboard' && (
            <div className="animate-fade-in">
                <h3 className="font-semibold mb-2">{t('squadHub.leaderboardTitle')}</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {sortedSquads.slice(0, 10).map((s, index) => {
                        const isUserSquad = s.id === squad.id;
                        const rank = index + 1;
                        const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
                        const rankIcon = rank <= 3 
                            ? <Icon name="trophy" className={`w-6 h-6 ${rankColors[rank-1]}`} /> 
                            : <span className="font-mono text-lg text-brand-text-muted">{rank}</span>;

                        return (
                            <div key={s.id} className={`flex items-center gap-4 p-3 rounded-lg ${isUserSquad ? 'bg-brand-primary/10 border-2 border-brand-primary/20' : 'bg-brand-bg/50'}`}>
                                <div className="w-8 text-center flex-shrink-0 flex justify-center items-center">{rankIcon}</div>
                                <div className="flex-grow">
                                    <p className={`font-bold text-lg ${isUserSquad ? 'text-brand-primary' : 'text-brand-text'}`}>{s.name}</p>
                                </div>
                                <div className="font-bold text-lg text-brand-text">{s.sharedMomentum.toLocaleString()}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {activeTab === 'members' && (
            <div className="animate-fade-in">
                <h3 className="font-semibold mb-2">{t('squadHub.membersTitle')}</h3>
                <div className="space-y-2">
                    {squad.members.map(memberName => (
                        <SquadMemberItem
                            key={memberName}
                            memberName={memberName}
                            isCurrentUser={memberName === user.name}
                            squad={squad}
                            onVoteToKick={onVoteToKick}
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};