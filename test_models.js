import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // List of potential model names to try
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-1.5-pro-001",
        "gemini-1.0-pro",
        "gemini-2.0-flash-exp"
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
            }
        }
    }
    console.log("\nAll models failed.");
}

test();
