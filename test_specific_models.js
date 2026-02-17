import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Models seen in the list output
    const modelsToTry = [
        "gemini-2.5-flash-native-audio-latest",
        "models/gemini-2.5-flash-native-audio-latest",
        "gemini-robotics-er-1.5-preview",
        "gemini-2.5-computer-use-preview-10-2025"
    ];

    for (const modelName of modelsToTry) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: "Hello" }]
                    }
                ]
            });
            console.log(`✅ SUCCESS: ${modelName} worked!`);
            console.log("Response:", response.text ? response.text.substring(0, 50) + "..." : "No text");
            return; // Exit on first success
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            // Only log the message to avoid clutter
            if (error.error && error.error.message) {
                console.log(`   Error: ${error.error.message}`);
            } else {
                console.log(`   Error code: ${error.status || 'unknown'}`);
                if (error.response) console.log(JSON.stringify(error.response));
            }
        }
    }
    console.log("\nAll models failed.");
}

test();
