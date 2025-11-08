import { GoogleGenAI } from "@google/genai";

// Fix: Per coding guidelines, the API key must come from process.env.API_KEY.
// The fallback logic and placeholder key have been removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklyInsight = async (completionData: {
  totalCompletions: number;
  completionRate: number;
  bestDay: string;
  worstDay: string;
  mostConsistentHabit: string;
}): Promise<string> => {
  // Fix: Removed check for placeholder API key. The try/catch block will handle API errors.
  const prompt = `
    Analyze the following user habit completion data for the past week:
    - Total Completions: ${completionData.totalCompletions}
    - Overall Completion Rate: ${completionData.completionRate.toFixed(0)}%
    - Most Successful Day: ${completionData.bestDay}
    - Most Challenging Day: ${completionData.worstDay}
    - Most Consistent Habit: "${completionData.mostConsistentHabit}"

    Based on this data, generate one actionable, encouraging, and concise insight (max 2 sentences) to help the user improve their habits or celebrate their success. Frame it from the perspective of a helpful coach. Do not repeat the input data in your response.
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
