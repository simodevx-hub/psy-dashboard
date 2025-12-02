import { GoogleGenAI } from "@google/genai";

export const summarizeNotes = async (notes: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment.");
    return "AI configuration missing. Please enable API key.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a clinical assistant. Summarize the following clinical notes into a concise 2-sentence progress update for a dashboard view. Maintain professional medical tone. Notes: "${notes}"`,
    });
    
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating summary.";
  }
};