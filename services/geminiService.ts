import { GoogleGenAI, Type } from '@google/genai';
import { BlueprintHabit, Habit, RallyPointData, User } from '../types';

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
): Promise<{ insight: string; suggestion: string; }> => {
  const prompt = `
    You are an encouraging and insightful performance coach.
    Analyze the following weekly habit statistics.
    1. Provide a short, motivational insight (2-3 sentences). Focus on celebrating wins and offering a gentle suggestion for improvement.
    2. Suggest one specific, actionable "micro-commitment" for next week based on the data. It should be a small, easy-to-achieve goal. For example, "Try doing '${stats.mostConsistentHabit}' on ${stats.worstDay} this week." or "Add one extra completion for any habit this week."

    Stats:
    - Total Completions: ${stats.totalCompletions}
    - Completion Rate: ${stats.completionRate.toFixed(0)}%
    - Best Day: ${stats.bestDay}
    - Worst Day: ${stats.worstDay}
    - Most Consistent Habit: "${stats.mostConsistentHabit}"

    Respond in JSON format with keys "insight" and "suggestion".
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
              insight: { type: Type.STRING },
              suggestion: { type: Type.STRING },
            },
            required: ['insight', 'suggestion'],
          },
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating weekly insight:', error);
    return {
        insight: 'An error occurred while generating your insight. Keep up the great work!',
        suggestion: 'Focus on consistency this week.'
    };
  }
};

export const generateProgressAnalysisReport = async (
    user: User,
    habits: Habit[],
    language: string
): Promise<string> => {
    const identityName = user.selectedIdentities[0]?.name || 'Achiever';
    const habitData = habits.map(h => `        - Habit: "${h.title}" (Streak: ${h.streak} days, Longest: ${h.longestStreak}, Completions: ${h.completions.length})`).join('\n');

    const prompt = `
        You are Momentum AI, an expert performance and habit formation coach. Your tone is incredibly positive, motivational, and insightful.
        You are generating a personalized progress report for **${user.name}**, who has chosen the identity of **${identityName}**.
        
        The final output MUST be clean, well-formatted Markdown with perfect grammar and spacing. Ensure every word is separated by a single space.
        
        Here is their habit data:
${habitData}

        Please generate a comprehensive report using the following structure. Use numbered headings for each section.

        **Momentum AI: Your Progress Report, ${user.name}**
        
        **Hello ${user.name}, ${identityName}!**
        
        Follow with a short, powerful introductory paragraph (2-3 sentences) celebrating their fantastic start, dedication, and consistency. Mention that you're impressed and ready to dive into the progress they're building.
        
        ---
        
        **1. Overall Summary:**
        Provide an exceptional analysis of their performance. If they have perfect completion, praise it as more than just a good start, but a "**powerful declaration** of your unwavering commitment to being ${identityName}." Mention their incredible rhythm, razor-sharp focus, and the **unstoppable momentum** they are building. End with an encouraging sentence like "Keep this energy soaring!"
        
        **2. Identity Alignment:**
        Analyze how their chosen habits are in **perfect harmonious alignment** with their identity as ${identityName}. If the alignment is strong, state it as a significant strength. Highlight one or two specific habits and explain *why* they are quintessential to their identity (e.g., "Your 'Daily Momentum Map' habit is quintessential for an Achiever...").
        
        **3. Strengths & Momentum Drivers:**
        Identify their strongest habits (long streaks, perfect consistency). Pinpoint these as the **foundational bedrock** and key **momentum drivers**. Celebrate these consistent actions as the foundation of their success.
        
        **4. Actionable Recommendations for Next Week:**
        Provide 2-3 specific, positive, and forward-looking suggestions. Frame them as ways to "amplify this incredible momentum" or "level-up". Suggestions could include deepening reflection, visualizing wins, or making micro-increment increases to focus.
        
        ---
        
        End with a final encouraging sign-off, like "Keep shining, ${user.name}!".
        
        Respond in the language with this code: ${language}.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error('Error generating progress analysis report:', error);
        return "There was an error generating your analysis. Please check your connection and try again. Remember, you're making great progress!";
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

export const generateRallyPoint = async (habit: Habit, language: string): Promise<RallyPointData> => {
    const prompt = `
        You are a master habit coach, specializing in compassionate recovery after a setback.
        A user just broke a streak for their habit: "${habit.title}". This habit helps them become "The ${habit.identityTag}".
        Your task is to create a "Rally Point" to help them get back on track.

        1.  First, create one empathetic, non-judgmental multiple-choice question to diagnose the issue. The question should be about the *hurdle* they faced.
        2.  Then, create three distinct, short, multiple-choice options for that question.
        3.  Finally, for each option, create a "Phoenix Protocol": a concrete, temporary, one-day micro-plan that makes restarting effortless. The protocol should be a single, encouraging sentence.

        Respond in the language with this code: ${language}.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    protocol: { type: Type.STRING },
                                },
                                required: ['text', 'protocol'],
                            }
                        }
                    },
                    required: ['question', 'options']
                }
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        // Ensure we only have 3 options max
        if (data.options.length > 3) {
            data.options = data.options.slice(0, 3);
        }
        return data;
    } catch (error) {
        console.error('Error generating Rally Point:', error);
        return {
            question: "It's okay to stumble. What was the biggest hurdle yesterday?",
            options: [
                {
                    text: "I didn't have the time.",
                    protocol: "No problem. For tomorrow, your mission is to do the habit for just 2 minutes. Let's make it easy to start again."
                },
                {
                    text: "I forgot about it.",
                    protocol: "Got it. For tomorrow, your mission is to set a reminder alarm on your phone right now. Let's make it impossible to forget."
                },
                {
                    text: "I didn't feel motivated.",
                    protocol: "That's completely normal. For tomorrow, your mission is to simply get your tools ready for the habit, nothing more. Let's lower the pressure."
                }
            ]
        };
    }
};