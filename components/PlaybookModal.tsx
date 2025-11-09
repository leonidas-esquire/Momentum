import React from 'react';
import { Icon } from './Icon';

declare const jspdf: any;

interface PlaybookModalProps {
  onClose: () => void;
}

const PLAYBOOK_MARKDOWN = `
# Momentum: The Ultimate Playbook
## Build Habits So Good, You'll Miss Them When You Skip Them

Welcome to Momentum! You're not just here to track tasks; you're here to forge a new identity. This playbook is your guide to mastering the app and, more importantly, mastering yourself.

Momentum is built on a simple but powerful idea from neuropsychology: **the most effective way to change what you do is to change who you believe you are.** Instead of just "trying to write more," you'll become "The Creator." Instead of "working out," you'll become "The Athlete."

This guide will walk you through every feature, from crafting your identity to leveraging your social squad to build unstoppable momentum.

## Chapter 1: The Onboarding Journey - Forging Your New Self

Your first five minutes in Momentum are the most crucial. This is where you lay the foundation for your new identity.

### Step 1: Answer the Core Question
The first thing we ask is, **"Who are you becoming?"** This isn't just a tagline; it's the central principle. Think about the person you aspire to be, and select the Identity Archetype that best represents that vision.

> **Why this works:** By focusing on identity, your habits become evidence of who you are, not just chores to be done. Each completion is a vote for your future self.

### Step 2: The AI Habit Blueprint
You've chosen your identity. Now what? Let our AI coach, powered by the Gemini API, design a starting set of habits for you.

*   **What it is:** Based on your chosen identity (e.g., "The Leader"), the AI generates 3-5 specific, actionable, and easy-to-start daily habits.
*   **How to use it:** Review the suggestions. Select the ones that resonate with you. You're not committing forever; you're choosing a starting point.

### Step 3: The Power of Loss Framing
This might feel like a tough question, but it's one of the most powerful motivators. We'll ask you: **"What's the cost of inaction?"**

*   **What it is:** You'll write a short reflection on what you stand to lose if you *don't* build this identity.
*   **Why this works:** Our brains are wired to avoid loss more strongly than they are to seek gains. By clearly defining the negative consequences of inaction, you create a powerful emotional incentive to stick with your habits, especially on days when motivation is low.

### Step 4: Craft Your Identity Statement
This is your personal mantra. You'll complete the sentence: "I am a [Your Identity] who..."

*   **Example:** "I am a Creator who brings ideas to life every single day, no matter what."
*   **How to use it:** This statement will be your North Star. Read it daily. It's the contract you make with yourself.

## Chapter 2: The Dashboard - Your Daily Command Center

The Dashboard is where the magic happens every day. It's designed to give you a clear, motivating overview of your progress.

### Your Identity Status
At the top, you'll see your Identity Cards. This is your "character sheet" for real life.
*   **Level:** Represents your commitment and growth in that identity.
*   **XP (Experience Points):** You gain XP every time you complete a habit linked to that identity. Fill the bar to level up and unlock new potential!

### Mastering Your Habits
Each \`HabitCard\` is packed with information:
*   **🔥 Streak:** Your current consecutive-day streak. This is your momentum visualized. Protect it!
*   **🛡️ Momentum Shields:** Life happens. Shields automatically protect your streak if you miss a day. You start with one and can earn more.
*   **📉 Missed Days:** If you've recently missed a day, this will appear as a reminder to get back on track. The core rule is **never miss twice.**
*   **⭐ Favorite:** Star a habit to keep it pinned to the top of your list.

**Actions:**
*   **✅ Complete:** The most important button in the app. Tap it to cast your vote for your future self.
*   **✏️ Edit / 🗑️ Delete:** Manage your habits as you evolve.
*   **🎤 Voice Note (Coming Soon):** A quick way to add context or reflections to your habit.

### The Daily Rituals
Consistency is built through rituals. Momentum gives you two powerful ones.

#### 1. The Daily Huddle (via Chatbot)
Start your day with focus. The Huddle is a brief, voice-based conversation with your Momentum AI coach.
*   It starts with a greeting and reminds you of your most important habit.
*   The goal is to lock in your focus and set your energy level for the day.

#### 2. The Daily Debrief
End your day with reflection. This is a crucial step that turns action into learning.
1.  **Mood:** Rate your day.
2.  **Guided Reflection:** Based on your completed/missed habits, the AI will ask you 2-3 thoughtful questions.
3.  **Private Note:** A space for your eyes only.
4.  **Share a Win:** The AI generates a positive, one-sentence summary of your day's success. You can choose to share this with your Squad to boost collective morale.

## Chapter 3: Your AI Coaching Team

Momentum isn't just a tracker; it's a team of AI coaches in your pocket, powered by Gemini.

### The Weekly Review
Every week, you'll be prompted to conduct a Strategic Review. It analyzes your stats (completion rate, best day, etc.) and provides:
*   **An Insightful Summary:** A short, motivational paragraph celebrating your wins.
*   **An Actionable Suggestion:** A "micro-commitment" for the upcoming week to help you improve.

### The Progress Analysis Report
For a deeper dive, generate an AI Progress Report at any time.
*   **What it is:** A comprehensive, personalized report written in Markdown. It analyzes your performance, how well your habits align with your identity, and identifies your key strengths.
*   **How to use it:** Read it to understand your patterns. Then, click **"Export to PDF"** to create a beautifully formatted document you can save and review over time.

### The Momentum Mentor
The app is always watching for opportunities to help. If it detects you're struggling with a habit (e.g., you've missed it for 3+ days), the Mentor's Corner will appear.
*   **What it is:** An AI-generated intervention that compassionately points out the struggle and suggests a "micro-habit"—a smaller, easier first step to get you back on track.

## Chapter 4: The Comeback Engine - Resilience is a Skill

Everyone stumbles. What separates success from failure is how quickly you get back up.

### The Rally Point
This is arguably the most powerful feature in Momentum. It triggers automatically when you break a significant streak (7+ days).

1.  **Diagnosis:** The AI presents an empathetic, multiple-choice question to help you understand *why* you missed your habit.
2.  **The Phoenix Protocol:** Based on your answer, the app provides a concrete, temporary, one-day micro-plan. This plan is designed to be ridiculously easy, making it almost effortless to restart your habit.
3.  **Light a Rally Beacon:** You have the option to notify your Squad that you're getting back on track. This is a call for encouragement, turning a moment of failure into an opportunity for connection.

## Chapter 5: Stronger Together - Social Momentum

You are the average of the five people you spend the most time with. Momentum makes it easy to surround yourself with people on the same path.

### The Squad Hub
Join or create a Squad (up to 5 members) focused on a shared identity.
*   **🤝 Shared Momentum:** Every habit completed by a squad member adds to the group's total momentum score.
*   **🏆 Quests:** Collaborative goals that the whole squad works towards.
*   **⚔️ The Saga:** This is the ultimate team challenge. It's a narrative-driven event where the squad combines their "Momentum Charges" (earned through consistency) to defeat a metaphorical "boss" like "The Snooze Fiend."
*   **💬 Chat:** The heart of the squad. Share wins, send encouragement, and see when a teammate lights a Rally Beacon.

### The Team Hub (Pro)
For larger organizations, the Team Hub provides leaderboards and team-wide challenges to foster a culture of growth and achievement.

## Chapter 6: Pro Tips & Advanced Strategies

*   **Habit Stacking:** Use the "Cue" in the Habit Builder to chain your habits together. Example: Set the cue for "Journaling" to be "After I finish my morning coffee."
*   **Review Your "Why":** Re-read your Loss Framing statement and Identity Statement whenever you feel your motivation waning.
*   **Customize Everything:** Go to **Settings** to change your app's theme, language, and even the gender and personality of the AI's voice to make the experience truly your own.
`;

// Helper function to render inline formatting like bold and italic text
const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-brand-text">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-brand-bg text-brand-primary font-mono text-sm px-1 py-0.5 rounded">{part.slice(1, -1)}</code>
        }
        return part;
    });
};

// Renders the full text with styled headings, paragraphs, and lists
const renderStyledText = (markdownText: string) => {
    const lines = markdownText.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-3 pl-2">
                    {currentListItems}
                </ul>
            );
            currentListItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim() === '') {
            flushList();
            continue;
        }
        
        const isListItem = line.startsWith('* ') || line.startsWith('- ');

        if (isListItem) {
            currentListItems.push(
                <li key={i}>{renderInlineFormatting(line.substring(2))}</li>
            );
        } else {
            flushList();

            if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-3xl font-bold mt-6 mb-3 text-brand-text border-b-2 border-brand-secondary pb-2">{renderInlineFormatting(line.substring(2))}</h1>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-2xl font-bold mt-6 mb-2 text-brand-text border-b border-brand-secondary/70 pb-1">{renderInlineFormatting(line.substring(3))}</h2>);
            } else if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-xl font-bold mt-5 mb-1 text-brand-primary">{renderInlineFormatting(line.substring(4))}</h3>);
            } else if (line.startsWith('> ')) {
                elements.push(<blockquote key={i} className="border-l-4 border-brand-secondary pl-4 my-3 italic text-brand-text">{renderInlineFormatting(line.substring(2))}</blockquote>)
            }
             else {
                elements.push(<p key={i} className="my-2 leading-relaxed">{renderInlineFormatting(line)}</p>);
            }
        }
    }
    
    flushList();

    return elements;
};


export const PlaybookModal: React.FC<PlaybookModalProps> = ({ onClose }) => {

    const handleExportToPDF = async () => {
        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // --- PDF Styling Constants ---
        const BRAND_COLOR = '#8A42D6';
        const TEXT_COLOR = '#111827';
        const MUTED_COLOR = '#6B7280';
        const PAGE_MARGIN_X = 20;
        const PAGE_MARGIN_Y = 25;
        const HEADER_Y = 15;
        const MAX_WIDTH = pdfWidth - PAGE_MARGIN_X * 2;
        
        // --- Cover Page ---
        pdf.setFillColor(BRAND_COLOR);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(40);
        pdf.setTextColor('#FFFFFF');
        pdf.text("Momentum", pdfWidth / 2, 80, { align: 'center' });
        pdf.setFontSize(20);
        pdf.setTextColor('#E4E4E6');
        pdf.text("The Ultimate Playbook", pdfWidth / 2, 100, { align: 'center' });
        pdf.setDrawColor('#FFFFFF');
        pdf.setLineWidth(0.5);
        pdf.line(PAGE_MARGIN_X, 130, pdfWidth - PAGE_MARGIN_X, 130);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor('#A0A0B0');
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, PAGE_MARGIN_X, pdfHeight - 30);
        
        // --- Report Content ---
        pdf.addPage();
        pdf.setTextColor(TEXT_COLOR);
        let y = PAGE_MARGIN_Y;

        const checkPageBreak = (neededHeight: number) => {
            if (y + neededHeight > pdfHeight - PAGE_MARGIN_Y) {
                pdf.addPage();
                y = PAGE_MARGIN_Y;
            }
        };
        
        const lines = PLAYBOOK_MARKDOWN.trim().split('\n');

        for(const line of lines) {
            if (line.trim() === '') {
                y += 5; // Add space for paragraph breaks
                checkPageBreak(0);
                continue;
            }

            let text = line;
            let fontSize = 11;
            let style = 'normal';
            let color = TEXT_COLOR;
            let leftMargin = PAGE_MARGIN_X;
            let spaceBefore = 2;

            if (line.startsWith('# ')) {
                text = line.substring(2); fontSize = 24; style = 'bold'; spaceBefore = 10;
            } else if (line.startsWith('## ')) {
                text = line.substring(3); fontSize = 18; style = 'bold'; spaceBefore = 8;
            } else if (line.startsWith('### ')) {
                text = line.substring(4); fontSize = 14; style = 'bold'; color = BRAND_COLOR; spaceBefore = 6;
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                text = '• ' + line.substring(2);
                leftMargin += 5;
            } else if (line.startsWith('> ')) {
                text = line.substring(2); style = 'italic'; color = MUTED_COLOR;
            }

            y += spaceBefore;
            checkPageBreak(10); // Check before processing to avoid splitting headings
            
            pdf.setFont('helvetica', style);
            pdf.setFontSize(fontSize);
            pdf.setTextColor(color);
            
            const splitText = pdf.splitTextToSize(text, MAX_WIDTH - (leftMargin - PAGE_MARGIN_X));
            
            for(const textLine of splitText) {
                const lineHeight = pdf.getTextDimensions(textLine).h;
                checkPageBreak(lineHeight);
                pdf.text(textLine, leftMargin, y);
                y += lineHeight;
            }
        }
        
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 2; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(MUTED_COLOR);
            pdf.text("Momentum Playbook", PAGE_MARGIN_X, HEADER_Y);
            pdf.text(`Page ${i-1} of ${totalPages-1}`, pdfWidth - PAGE_MARGIN_X, HEADER_Y, { align: 'right' });
        }

        pdf.save(`Momentum_Playbook.pdf`);
      };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-brand-surface w-full max-w-3xl rounded-2xl border border-brand-secondary shadow-2xl flex flex-col animate-slide-in-up">
                <header className="p-6 border-b border-brand-secondary flex justify-between items-center flex-shrink-0">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon name="book-open" className="w-6 h-6" />
                    Momentum Playbook
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportToPDF}
                        className="flex items-center gap-1.5 text-brand-text-muted font-semibold text-sm hover:text-white py-2 px-3 rounded-full hover:bg-brand-secondary/20 transition-colors"
                        title="Export to PDF"
                    >
                        <Icon name="arrow-down-tray" className="w-5 h-5" />
                        <span>Export PDF</span>
                    </button>
                    <button onClick={onClose} className="text-brand-text-muted hover:text-white p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center">&times;</button>
                </div>
                </header>

                <div className="overflow-y-auto max-h-[70vh]">
                    <div className="p-6 md:p-8 text-brand-text-muted">
                        {renderStyledText(PLAYBOOK_MARKDOWN)}
                    </div>
                </div>
            </div>
        </div>
    );
};
