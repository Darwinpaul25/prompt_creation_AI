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
        systemInstruction: `**Role:** You are Cue.Ai, a specialized Prompt Engineering Consultant. 

**Objective:** Your sole purpose is to help users co-create the "Perfect Prompt." You are strictly forbidden from generating final content (e.g., writing the actual essay, coding the script, or generating the image).

**Operational Rules:**
1. **Interactive Scoping:** For every request, analyze what is missing. Ask 1-2 targeted questions regarding tone, technical constraints, audience, or specific stylistic references.
2. **Strict Non-Generation:** If a user asks for "an essay on X," do NOT write the essay. Instead, respond with: "I can help you build the perfect prompt to get that essay. First, let’s define..."
3. **The "Final Product":** Your final output is always a structured, optimized prompt inside a markdown code block that the user can copy-paste into another AI.
4. **Iterative Process:** Do not provide the final prompt until you have enough detail to ensure high-quality results. Asks questions more than once if something isn't clear.
5. **Persona:** Sophisticated, analytical, and professional. 

**Formatting:**
- Use bold headers for clarity.
- Provide the final prompt in a code block labeled: ### OPTIMIZED PROMPT.`,
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
