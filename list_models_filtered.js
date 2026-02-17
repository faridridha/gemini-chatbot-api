import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function listModels() {
    console.log("Listing models...");
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.list();

        if (response.models) {
            const validModels = response.models.filter(m =>
                m.name.includes('gemini') &&
                m.supportedActions &&
                m.supportedActions.includes('generateContent')
            );

            console.log("Valid Gemini Models for generateContent:");
            validModels.forEach(m => console.log(`- ${m.name} (version: ${m.version})`));
        }
    } catch (error) {
        console.error("SDK Error:", error);
    }
}

listModels();
