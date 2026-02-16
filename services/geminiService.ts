import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askLicensingAI = async (prompt: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context about M365 Plans: ${context || 'General M365 Licensing'}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction: `You are an expert Microsoft 365 Licensing Consultant. 
        Your goal is to help users understand the complex landscape of M365 plans (E3, E5, Business Premium, F3, etc.).
        Be concise, accurate, and focus on value-for-money and security requirements.
        If you are unsure about pricing, mention it is estimated and can change.
        Suggest the most cost-effective plan based on their needs.
        Keep responses in clear Markdown format.`,
        temperature: 0.7,
      },
    });

    // Fix: Access .text as a property as per guidelines (not a method)
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI assistant is currently unavailable. Please check your network or try again later.";
  }
};