import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function listModels() {
    console.log("Listing models...");
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.list();

        if (response.models) {
            console.log("Available Models:");
            response.models.forEach(m => {
                console.log(`- ${m.name}`);
                if (m.supportedActions) {
                    console.log(`  Actions: ${m.supportedActions.join(', ')}`);
                }
            });
        } else {
            console.log("No models found in response.");
        }
    } catch (error) {
        console.error("SDK Error:", error);
    }
}

listModels();
