import { GoogleGenAI, Type } from "@google/genai";
import { BlueprintHabit, Ripple } from '../types';

// Fix: Initialize the GoogleGenAI client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Fix: Define the model to be used for consistency.
const model = 'gemini-2.5-flash';

export const generateHabitBlueprint = async (identityName: string, language: string): Promise<BlueprintHabit[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 3 actionable, specific habits for someone who identifies as "${identityName}". Each habit should have a title (max 5 words), a short description (max 15 words), and a simple cue (e.g., "In the morning", "After my workout"). Respond in ${language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cue: { type: Type.STRING },
            },
            required: ['title', 'description', 'cue'],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const habits = JSON.parse(jsonString);
    return habits as BlueprintHabit[];
  } catch (error) {
    console.error("Error generating habit blueprint:", error);
    return [
      { title: 'Review Daily Goals', description: 'Quickly check your top priorities for the day.', cue: 'With morning coffee' },
      { title: 'Practice One Skill', description: 'Dedicate 15 minutes to deliberate practice.', cue: 'After work' },
      { title: 'Plan Tomorrow', description: 'Set your main objective for the next day.', cue: 'Before bed' },
    ];
  }
};

export const generateWeeklyInsight = async (stats: any, language: string): Promise<string> => {
  try {
    const prompt = `Based on these weekly stats, generate a concise, encouraging, and actionable insight (max 40 words). Stats: ${JSON.stringify(stats)}. Respond in ${language}.`;
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating weekly insight:", error);
    return "Keep up the great work! Consistency is key to building momentum.";
  }
};

export const generateSquadInvitationEmail = async (squadName: string, inviterName: string, goalIdentity: string, language: string): Promise<{ subject: string; body: string; }> => {
    try {
        const prompt = `Generate a short, exciting, and friendly email to invite someone to join a small accountability group called a "Squad".
        Squad Name: "${squadName}"
        Inviter's First Name: ${inviterName}
        Squad's Shared Goal: Becoming a "${goalIdentity}"
        The app is called Momentum. The email should be persuasive and create a sense of shared purpose.
        The response should be in ${language}.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["subject", "body"]
                }
            }
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating squad invitation email:", error);
        return {
            subject: `You're Invited to Join ${squadName}!`,
            body: `Hey!\n\n${inviterName} has invited you to join their accountability squad, "${squadName}," on the Momentum app. We're all working towards becoming a ${goalIdentity} together.\n\nLet's build some momentum!\n\nBest,\n${inviterName}`
        };
    }
};

export const generateMembershipPitch = async (userName: string, squadName: string, goalIdentity: string, language: string): Promise<string> => {
    try {
        const prompt = `Generate a short, compelling pitch (max 50 words) for ${userName} to send when requesting to join the squad "${squadName}". The squad's goal is to become a "${goalIdentity}". The pitch should show enthusiasm and commitment. Respond in ${language}.`;
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating membership pitch:", error);
        return `Hi team! I'm really passionate about becoming a ${goalIdentity} and I'd love to join your squad to share the journey and keep each other accountable.`;
    }
};


export const generateDebriefQuestionsAndWin = async (habitsToday: {title: string, completed: boolean}[], privateNote: string, language: string): Promise<{ questions: string[], shareableWin: string }> => {
    try {
        const prompt = `A user is doing their daily debrief.
        Today's habits: ${JSON.stringify(habitsToday)}.
        Their private thoughts so far: "${privateNote}"
        
        Based on this, generate:
        1. Two thoughtful, open-ended follow-up questions to help them reflect deeper on their day.
        2. One concise, positive, "shareable win" (max 20 words) that they could post to their accountability squad.
        
        Respond in ${language}.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        shareableWin: { type: Type.STRING }
                    },
                    required: ["questions", "shareableWin"]
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (result.questions.length < 2) {
           result.questions.push("What's one thing you can do to make tomorrow even better?");
        }
        return {
            questions: result.questions.slice(0, 2),
            shareableWin: result.shareableWin,
        };

    } catch (error) {
        console.error("Error generating debrief questions:", error);
        return {
            questions: [
                "What was the biggest challenge you faced today?",
                "What are you most grateful for from today's experiences?",
            ],
            shareableWin: "Made some progress today! Looking forward to crushing it again tomorrow."
        };
    }
};

export const generateSquadHuddlePrompt = async (squadName: string, goalIdentity: string, recentRipples: Ripple[], language: string): Promise<string> => {
    try {
        const rippleSummary = recentRipples.map(r => ` - ${r.authorName}: ${r.message}`).join('\n');
        const context = recentRipples.length > 0 ? `Here's what the squad has been up to:\n${rippleSummary}` : "The squad has been a bit quiet lately.";

        const prompt = `You are the AI Co-Captain for a squad named "${squadName}" whose goal is to become a "${goalIdentity}".
        
        ${context}
        
        Based on this, generate one engaging, open-ended "Squad Huddle" question (max 25 words) to post in the chat. Make it encouraging and focused on either celebrating wins, overcoming obstacles, or re-engaging the team. Start the message with "Huddle time!".
        
        Respond in ${language}.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating squad huddle prompt:", error);
        return "Huddle time! What's one thing we can all do today to move closer to our goal?";
    }
};

export const generateAssistMessages = async (requesterName: string, requesterIdentity: string, habitTitle: string, language: string): Promise<string[]> => {
    try {
        const prompt = `A user named ${requesterName}, who is striving to be a "${requesterIdentity}", is struggling with their habit "${habitTitle}" and has asked for help. Generate 3 short, distinct, and encouraging messages (max 15 words each) that a teammate could send them. The tone should be supportive, not demanding. Respond in ${language}.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating assist messages:", error);
        return [
            `You've got this, ${requesterName}! One step at a time.`,
            `Remember why you started, ${requesterIdentity}! We're here for you.`,
            `Keep pushing! Your progress inspires us all.`
        ];
    }
};