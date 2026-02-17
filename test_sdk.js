import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
    console.log("Testing SDK...");
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log("Client created.");

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: "Hello" }]
                }
            ]
        });

        console.log("Response received.");
        console.log("Type of response:", typeof response);
        console.log("Response keys:", Object.keys(response));
        if (response.text) {
            console.log("response.text:", response.text);
        } else {
            console.log("response.text is undefined");
        }
    } catch (error) {
        console.error("SDK Error:", error);
    }
}

test();
