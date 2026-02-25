import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { IChatAiService, AiChatResponse } from "../../application/interfaces/services/IChatAiService";
import { ChatMessage, ChatRole } from "../../domain/value-objects/ChatSessionTypes";

export class GeminiChatService implements IChatAiService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;
 
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY; 
    this.modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";
    
    if (!apiKey) {
      throw new Error("CRITICAL: GEMINI_API_KEY is missing from .env");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Helper to map our domain roles to Gemini roles
  private mapRole(role: ChatRole): "user" | "model" {
    return role === "model" ? "model" : "user";
  }

  async sendMessage(
    history: ChatMessage[], 
    newMessage: string, 
    systemInstruction: string
  ): Promise<AiChatResponse> {
    
    const model = this.genAI.getGenerativeModel({ 
      model: this.modelName,
      systemInstruction: systemInstruction,
      safetySettings: [
        { 
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, 
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE 
        }
      ]
    });

    // Format previous history for Gemini
    const formattedHistory = history.map(msg => ({
      role: this.mapRole(msg.role),
      parts: [{ text: msg.content }]
    }));

    // Start chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.2,  
        maxOutputTokens: 500,
      }
    });

    // Send the new message
    const result = await chat.sendMessage(newMessage);
    const response = result.response;

    return {
      text: response.text(),
      tokenUsage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      }
    };
  }

  async generateSummary(history: ChatMessage[]): Promise<{ text: string; shortBullets: string[] }> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
    const transcript = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n");
    
    const prompt = `
      Summarize the following troubleshooting chat transcript for a home service technician.
      Provide a concise 1-2 sentence overview, and exactly 3 short bullet points highlighting the main issues/steps tried.
      Format the response strictly as a JSON object: { "text": "...", "shortBullets": ["...", "...", "..."] }
      
      Transcript:
      ${transcript}
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: { responseMimeType: "application/json" }  
    });

    try {
      const parsed = JSON.parse(result.response.text());
      return {
        text: parsed.text || "Summary unavailable",
        shortBullets: parsed.shortBullets || []
      };
    } catch (error) {
      console.error("Failed to parse Gemini summary JSON", error);
      return { text: "Chat escalated to technician.", shortBullets: [] };
    }
  }
}