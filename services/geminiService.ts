
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from the environment.
// In a real application, this would be managed securely.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Gets up-to-date, accurate information using Google Maps grounding.
 * @param prompt The user's query about logistics, locations, etc.
 * @param location The user's current geolocation coordinates.
 * @returns The model's response text and any grounding chunks.
 */
export const askWithMaps = async (prompt: string, location: GeolocationCoordinates) => {
  if (!API_KEY) throw new Error("API key is not configured.");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          },
        },
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, groundingChunks };
  } catch (error) {
    console.error("Error querying Gemini with Maps Grounding:", error);
    return { text: "Sorry, I couldn't get an answer right now. Please try again later.", groundingChunks: [] };
  }
};

/**
 * Handles complex user queries using Gemini 2.5 Pro with max thinking budget.
 * @param prompt The user's complex query.
 * @returns The model's detailed response.
 */
export const askWithThinking = async (prompt: string) => {
  if (!API_KEY) throw new Error("API key is not configured.");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    
    return { text: response.text };
  } catch (error) {
    console.error("Error querying Gemini with Thinking Mode:", error);
    return { text: "Sorry, I encountered an issue processing your complex query. Please try again." };
  }
};
