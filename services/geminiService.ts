import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BlueprintHabit, Habit, Mission, UserIdentity } from '../types';

// Fix: Per coding guidelines, the API key must come from process.env.API_KEY.
// The fallback logic and placeholder key have been removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklyInsight = async (
  completionData: {
    totalCompletions: number;
    completionRate: number;
    bestDay: string;
    worstDay: string;
    mostConsistentHabit: string;
  },
  language: string
): Promise<string> => {
  // Fix: Removed check for placeholder API key. The try/catch block will handle API errors.
  const prompt = `
    Analyze the following user habit completion data for the past week:
    - Total Completions: ${completionData.totalCompletions}
    - Overall Completion Rate: ${completionData.completionRate.toFixed(0)}%
    - Most Successful Day: ${completionData.bestDay}
    - Most Challenging Day: ${completionData.worstDay}
    - Most Consistent Habit: "${completionData.mostConsistentHabit}"

    Based on this data, generate one actionable, encouraging, and concise insight (max 2 sentences) to help the user improve their habits or celebrate their success. Frame it from the perspective of a helpful coach. Do not repeat the input data in your response.
    Respond in this language: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating weekly insight:", error);
    return "There was an issue generating your AI insight. It seems your best day was " + completionData.bestDay + ". Try to replicate what made that day successful!";
  }
};

export const generateHabitEvolutionSuggestions = async (
  identityName: string,
  habitTitle: string,
  language: string
): Promise<string[]> => {
  const prompt = `A user who identifies as '${identityName}' has just leveled up. Their current habit is '${habitTitle}'. Suggest 3 creative and distinct ways they can evolve this habit to deepen their identity. The suggestions should be slightly more challenging but still achievable, and framed as exciting next steps. Return ONLY a JSON array of strings, like ["suggestion 1", "suggestion 2", "suggestion 3"]. Do not include any other text or markdown. The content of the strings in the JSON array must be in this language: ${language}.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    // The response text is expected to be a JSON string array.
    const suggestions = JSON.parse(response.text.trim());
    if (Array.isArray(suggestions)) {
      return suggestions.slice(0, 3); // Ensure max 3 suggestions
    }
    throw new Error("Response was not a JSON array.");
  } catch (error) {
    console.error("Error generating habit evolution suggestions:", error);
    // Provide fallback suggestions if the API call or parsing fails
    return [
      `Increase duration/reps of "${habitTitle}"`,
      `Try a variation of "${habitTitle}"`,
      `Tackle "${habitTitle}" earlier in the day`,
    ];
  }
};

export const generateSquadInsight = async (
  squadName: string,
  activitySummary: string,
  language: string,
): Promise<string> => {
  const prompt = `
    You are an AI coach for a habit-building squad named "${squadName}".
    Their recent collective activity is: ${activitySummary}.
    Based on this, generate one short (max 2 sentences), collective, and encouraging insight for the whole team. Focus on shared momentum, teamwork, and positive reinforcement. Do not just list the activities back to them.
    Respond in this language: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating squad insight:", error);
    return `The energy in ${squadName} is electric! Keep encouraging each other and building on this fantastic momentum.`;
  }
};

export const generateHabitBlueprint = async (
  identityName: string,
  language: string,
): Promise<BlueprintHabit[]> => {
  const prompt = `
    You are an expert habit formation coach designing a "Momentum Blueprint" for a user who has chosen the identity of '${identityName}'. 
    Generate a JSON array of 3 foundational, actionable, and easy-to-start habits.
    For each habit, provide a concise 'title', a one-sentence 'description', and a suggested 'cue' from this list: ['In the morning', 'After my workout', 'During my lunch break', 'Before bed'].
    The values for 'title' and 'description' must be translated into this language: ${language}.
    Ensure the response adheres strictly to the JSON schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cue: { type: Type.STRING },
            },
            required: ["title", "description", "cue"]
          }
        }
      }
    });

    const blueprint = JSON.parse(response.text.trim());
    if (Array.isArray(blueprint)) {
      return blueprint;
    }
    throw new Error("Response was not a JSON array.");

  } catch (error) {
    console.error(`Error generating habit blueprint for ${identityName}:`, error);
    // Fallback
    const identityRoot = identityName.replace('The ', '').toLowerCase();
    return [
      { title: `Read one page about being a ${identityRoot}`, description: 'Expand your knowledge in your chosen field.', cue: 'In the morning' },
      { title: `Practice a ${identityRoot} skill for 5 mins`, description: 'Dedicate a small amount of time to a fundamental skill.', cue: 'During my lunch break' },
      { title: `Plan tomorrow's ${identityRoot} action`, description: 'Set a clear intention for the next day.', cue: 'Before bed' },
    ];
  }
};

export const generateMomentumMission = async (
  leastConsistentHabit: Habit,
  mostConsistentHabit: Habit | null,
  language: string,
): Promise<{ title: string; description: string; targetCompletions: number }> => {
  const prompt = `
    You are a motivational habit coach. A user's least consistent habit (by streak) is '${leastConsistentHabit.title}'. Their most consistent habit is '${mostConsistentHabit?.title || 'none currently'}'.
    Generate a JSON object for a weekly "Momentum Mission". The mission must challenge them to complete their least consistent habit a specific number of times this week (a number between 3 and 5).
    The mission needs a creative 'title' and a short, encouraging 'description' (max 2 sentences).
    The 'title' and 'description' must be in this language: ${language}.
    Return a JSON object with 'title', 'description', and 'targetCompletions'. Do not include any other text or markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            targetCompletions: { type: Type.NUMBER },
          },
          required: ["title", "description", "targetCompletions"],
        }
      }
    });

    const missionData = JSON.parse(response.text.trim());
    // Clamp target completions to be reasonable
    missionData.targetCompletions = Math.max(3, Math.min(5, missionData.targetCompletions));
    return missionData;

  } catch (error) {
    console.error(`Error generating momentum mission:`, error);
    return {
      title: `The '${leastConsistentHabit.title}' Focus`,
      description: `Turn a challenging habit into a strength. Complete it 4 times this week to build momentum!`,
      targetCompletions: 4,
    };
  }
};

export const generateDailyHuddle = async (
    userName: string,
    habits: Habit[],
    mission: Mission | null,
    language: string,
): Promise<{ greeting: string; mostImportantHabitId: string }> => {
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const habitsSummary = habits.map(h => `- "${h.title}" (Current Streak: ${h.streak} days)`).join('\n');
    const missionInfo = mission ? `They are on a mission called "${mission.title}" to complete "${habits.find(h => h.id === mission.habitId)?.title}" ${mission.targetCompletions} times.` : "They have no active mission.";

    const prompt = `
        You are an AI habit coach. It's ${today}. Your user is ${userName}.
        Here are their current habits and streaks:
        ${habitsSummary}
        ${missionInfo}

        Your tasks:
        1. Write a short, personalized, and motivational greeting (1-2 sentences). Mention the day and something positive about their progress or a specific habit. The greeting must be in this language: ${language}.
        2. Identify the single "Most Important Habit" for them to focus on today. Prioritize the mission habit if it exists and isn't complete. Otherwise, pick a habit with a low streak or one that's about to hit a milestone (like 7 or 30 days).
        
        Return a JSON object with "greeting" and "mostImportantHabitId". Do not include any other text or markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        greeting: { type: Type.STRING },
                        mostImportantHabitId: { type: Type.STRING },
                    },
                    required: ["greeting", "mostImportantHabitId"],
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating daily huddle:", error);
        const fallbackHabit = mission ? mission.habitId : (habits[0]?.id || '');
        return {
            greeting: `Welcome back, ${userName}! Let's make today count. What's your top priority?`,
            mostImportantHabitId: fallbackHabit,
        };
    }
};

export const generateLowEnergySuggestion = async (habitTitle: string, language: string): Promise<{ title: string }> => {
    const prompt = `
        A user has low energy. Their most important habit is "${habitTitle}". 
        Generate a supportive message and suggest a "micro-version" of this habit to maintain momentum.
        For example, if the habit is "Write 500 words", suggest "Just write one sentence". If it's "Run 3 miles", suggest "Put on your running shoes and walk for 5 minutes".
        The micro-habit suggestion in the "title" field must be in this language: ${language}.
        Return a JSON object with a single key "title" containing the micro-habit suggestion.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                    },
                    required: ["title"],
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating low energy suggestion:", error);
        return {
            title: `Do ${habitTitle} for 1 minute`,
        };
    }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const generateSquadInvitationEmail = async (
  squadName: string,
  userName: string,
  goalIdentity: string,
  language: string,
): Promise<{ subject: string; body: string }> => {
  const prompt = `
    You are an expert copywriter tasked with creating a compelling and friendly email invitation.
    The user, ${userName}, wants to invite a friend to join their habit-building squad on the "Momentum" app.

    Squad Name: "${squadName}"
    Squad's Shared Goal Identity: "The ${goalIdentity}"

    Your task is to generate a JSON object with two keys: "subject" and "body". The content must be in this language: ${language}.

    The "subject" should be exciting and create curiosity.
    The "body" of the email should be:
    - Personal and friendly in tone.
    - Briefly explain what the Momentum app is (building positive habits, social accountability).
    - Mention the squad's name and its goal.
    - Create a sense of shared purpose and friendly competition.
    - End with a clear call to action to join the squad.
    - Use placeholders like "[Friend's Name]" and "[Your Name]" where appropriate. The body should be formatted with newlines for readability.
    
    Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ["subject", "body"],
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error generating squad invitation email:", error);
    return {
      subject: `You're Invited to Join My Squad: ${squadName}!`,
      body: `Hey [Friend's Name],\n\nI've started using this awesome app called Momentum to build better habits, and I've created a squad called "${squadName}". Our goal is to become better ${goalIdentity}s together.\n\nI thought of you immediately and would love for you to join us. We can keep each other accountable and motivated.\n\nLet me know if you're in!\n\nBest,\n${userName}`,
    };
  }
};

export const generateSquadRecruitmentMessage = async (
  userName: string,
  identities: UserIdentity[],
  language: string
): Promise<string> => {
    const identityNames = identities.map(i => i.name).join(', ');
    const prompt = `
        You are an AI habit coach for the Momentum app.
        A user named ${userName} is not currently in a squad. Their chosen identities are: ${identityNames}.
        Generate a short, powerful, and encouraging message (2-3 sentences) explaining WHY they should start a squad, connecting it to their chosen identities.
        Make it sound inspiring and focus on the benefits of teamwork and shared goals.
        Do not ask a question. State the benefit clearly.
        Respond in this language: ${language}.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating squad recruitment message:", error);
        return `Building habits as a ${identityNames} is powerful. Doing it with a team amplifies that power exponentially. Create a squad to share momentum and achieve your goals faster, together.`;
    }
};

export const generateMembershipPitch = async (
  userName: string,
  squadName: string,
  goalIdentity: string,
  language: string,
): Promise<string> => {
  const prompt = `
    You are an AI assistant helping a user named ${userName} write a compelling pitch to join a habit-building squad called "${squadName}".
    The squad's shared goal is to embody the "${goalIdentity}" identity.
    Generate a short, friendly, and persuasive pitch (2-4 sentences) from ${userName}'s perspective.
    It should express enthusiasm for the squad's goal and highlight why they would be a good, motivated member.
    Return only the pitch text as a single string. The pitch must be in this language: ${language}.
    Do not include any other text or markdown.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating membership pitch:", error);
    return `Hi team! I'm really excited about your squad's focus on becoming better ${goalIdentity}s. I'm committed to my habits and I believe joining "${squadName}" will help us all build incredible momentum together. I'd love to be a part of the team!`;
  }
};
