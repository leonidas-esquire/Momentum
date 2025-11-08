import { GoogleGenAI, Type } from '@google/genai';
import { BlueprintHabit } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const generateHabitBlueprint = async (identityName: string, language: string): Promise<BlueprintHabit[]> => {
  const prompt = `
    You are an expert habit formation coach.
    Based on the identity of "The ${identityName}", generate 3-5 specific, actionable, and easy-to-start daily habits.
    For each habit, provide a "title", a "description", and a "cue" (a trigger for the habit, like "In the morning" or "After work").
    Focus on small, achievable actions.
    Respond in the language with this code: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
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

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating habit blueprint:', error);
    // Fallback with a generic habit if API fails
    return [
      {
        title: 'Review Your Goals',
        description: `Take 5 minutes to look over your goals related to being a ${identityName}.`,
        cue: 'In the morning with your coffee',
      },
    ];
  }
};

export const generateWeeklyInsight = async (
  stats: {
    totalCompletions: number;
    completionRate: number;
    bestDay: string;
    worstDay: string;
    mostConsistentHabit: string;
  },
  language: string
): Promise<string> => {
  const prompt = `
    You are an encouraging and insightful performance coach.
    Analyze the following weekly habit statistics and provide a short, motivational insight (2-3 sentences).
    Focus on celebrating wins and offering a gentle suggestion for improvement.
    Stats:
    - Total Completions: ${stats.totalCompletions}
    - Completion Rate: ${stats.completionRate.toFixed(0)}%
    - Best Day: ${stats.bestDay}
    - Worst Day: ${stats.worstDay}
    - Most Consistent Habit: "${stats.mostConsistentHabit}"
    Respond in the language with this code: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error('Error generating weekly insight:', error);
    return 'An error occurred while generating your insight. Keep up the great work!';
  }
};

export const generateDebriefQuestionsAndWin = async (
    habitsToday: { title: string; completed: boolean }[],
    privateNote: string,
    language: string
): Promise<{ questions: string[]; shareableWin: string }> => {
    const prompt = `
      You are a compassionate journal guide. Based on the user's completed/missed habits for today, generate 2-3 thoughtful, open-ended reflection questions.
      Then, based on the completed habits and the user's private notes, generate one positive, shareable "win" for the day (1 sentence) that they could share with their support squad.

      Today's Habits:
      ${habitsToday.map(h => `- ${h.title}: ${h.completed ? 'Completed' : 'Missed'}`).join('\n')}

      User's Private Note: "${privateNote}"

      Respond in the language with this code: ${language}.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        shareableWin: { type: Type.STRING }
                    },
                    required: ['questions', 'shareableWin']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating debrief questions:', error);
        return {
            questions: [
                "What was one highlight from your day?",
                "Is there anything you would do differently tomorrow?"
            ],
            shareableWin: "I made progress on my goals today!"
        };
    }
};

export const generateAssistMessages = async (
    requesterName: string,
    requesterIdentity: string,
    habitTitle: string,
    language: string
): Promise<string[]> => {
    const prompt = `
      You are a supportive friend in a habit-building app. Your friend ${requesterName}, who is building their identity as "The ${requesterIdentity}", has requested assistance with their habit: "${habitTitle}".
      Generate 3 distinct, short, encouraging messages (1 sentence each) they could send. The messages should be empathetic and motivational.
      Respond in the language with this code: ${language}.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating assist messages:', error);
        return [
            `You've got this, ${requesterName}!`,
            `Keep pushing towards your goal!`,
            `One step at a time makes a big difference.`
        ];
    }
};
