import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function listModels() {
    console.log("Listing models...");
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.list();

        console.log("Models:");
        // The structure might vary, let's log everything
        console.dir(response, { depth: null });

        if (response.models) {
            response.models.forEach(m => console.log(`- ${m.name}`));
        }
    } catch (error) {
        console.error("SDK Error:", error);
    }
}

listModels();
