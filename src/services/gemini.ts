import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isTask?: boolean;
}

export async function sendMessage(history: { role: "user" | "model", parts: { text: string }[] }[], message: string) {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [...history, { role: "user", parts: [{ text: message }] }],
    config: {
      systemInstruction: `You are QAI, the world's most advanced Prompt Architect. 
      Your goal is to help users create "masterpiece" prompts for AI models.
      
      CRITICAL RULES:
      1. DO NOT give the final prompt immediately.
      2. Ask simple, engaging questions ONE BY ONE to understand the user's vision.
      3. Be precise, encouraging, and exciting. 
      4. Once you have enough information (usually after 3-5 questions), craft a "piece of art" final prompt.
      5. The final prompt MUST be enclosed in a markdown code block for easy copying.
      6. Use elegant language and maintain a sophisticated, professional, yet fun persona.
      
      If the user is vague, ask clarifying questions about:
      - The desired output format
      - The tone and style
      - The target audience
      - Specific constraints or data to include`,
    }
  });

  const response = await model;
  return response.text;
}

export async function generateTitle(prompt: string) {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: `Create a very short, 2-4 word title for a chat that starts with this prompt: "${prompt}". Return ONLY the title text, no quotes or punctuation.` }] }],
  });

  const response = await model;
  return response.text?.trim() || "New Conversation";
}
