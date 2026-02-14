
// Always use import {GoogleGenAI} from "@google/genai";
import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from "./types";

// Using the recommended model for complex reasoning and multimodal tasks
const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing the GenAI client with named parameter apiKey as required
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  /**
   * Parses a natural language request into a structured calendar event.
   */
  async parseScheduleRequest(input: string): Promise<CalendarEvent | null> {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
      La date d'aujourd'hui est ${today}.
      Extrais les détails de l'événement à partir de la requête utilisateur suivante : "${input}".
      Si aucune heure n'est mentionnée, utilise une heure par défaut raisonnable.
      Retourne les résultats au format JSON suivant :
      {
        "title": "Nom de l'événement",
        "date": "YYYY-MM-DD",
        "startTime": "HH:mm",
        "duration": "ex: 1h",
        "category": "work/personal/health/social",
        "description": "notes optionnelles"
      }
    `;

    try {
      // Simplified contents to use the recommended string format
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING },
              startTime: { type: Type.STRING },
              duration: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['work', 'personal', 'health', 'social'] },
              description: { type: Type.STRING }
            },
            required: ["title", "date", "startTime", "duration", "category"]
          }
        },
      });

      // Directly accessing the .text property of GenerateContentResponse
      const data = JSON.parse(response.text || "{}");
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
      };
    } catch (e) {
      console.error("Erreur d'analyse :", e);
      return null;
    }
  }

  /**
   * Used by the Memorise application for basic scheduling assistant tasks.
   */
  async getChatAssistantResponse(message: string, history: any[]) {
    const chat = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "Tu es l'assistant Memorise, un expert en organisation minimaliste. Aide les utilisateurs à gérer leur temps. Sois bref, professionnel et encourageant en français. Si l'utilisateur veut ajouter un rendez-vous, confirme que c'est fait.",
      },
      history: history,
    });

    // sendMessage call with message parameter as a simple string
    const response = await chat.sendMessage({ message });
    return response.text;
  }

  /**
   * Used by the ZenBot ChatWidget. 
   * Fixed the missing property error and added support for multimodal image analysis.
   */
  async getChatResponse(message: string, history: any[], imageBase64?: string) {
    const chat = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are ZenBot, an expert in room organization and minimalism. Help the user organize their space based on the photo provided if any. Be concise and professional.",
      },
      history: history,
    });

    if (imageBase64) {
      // Parse the data URL to extract mimeType and base64 data parts
      const match = imageBase64.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        const mimeType = match[1];
        const data = match[2];
        
        // Multimodal support: message can accept an array of parts
        const response = await chat.sendMessage({
          message: [
            { text: message },
            { inlineData: { mimeType, data } }
          ]
        });
        return response.text;
      }
    }

    // Default text-only response if no image is present
    const response = await chat.sendMessage({ message });
    return response.text;
  }
}

export const geminiService = new GeminiService();
