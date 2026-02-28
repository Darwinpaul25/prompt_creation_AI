import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isTask?: boolean;
}

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing. Please ensure it is set in the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
}

export async function sendMessage(history: { role: "user" | "model", parts: { text: string }[] }[], message: string) {
  try {
    const ai = getAI();
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are CUE AI. 
        Goal: Help users engineer perfect responses.
        Rules:
        1. Don't give the final response immediately if it's a complex request.
        2. Ask 1-2 clarifying questions first to understand vision/tone/audience if needed.
        3. Keep responses concise and engaging.
        4. Once ready, provide the final response in a markdown code block if applicable.
        5. Persona: Sophisticated, professional, and helpful.`,
      }
    });

    const response = await model;
    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }
    return response.text;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

export async function generateTitle(prompt: string) {
  try {
    const ai = getAI();
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `Create a very short, 2-4 word title for a chat that starts with this prompt: "${prompt}". Return ONLY the title text, no quotes or punctuation.` }] }],
    });

    const response = await model;
    return response.text?.trim() || "New Conversation";
  } catch (error) {
    console.error("Error in generateTitle:", error);
    return "New Conversation";
  }
}
