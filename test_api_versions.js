import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testVersions() {
    const versions = ['v1', 'v1beta', 'v1alpha'];
    const modelName = 'gemini-1.5-flash';

    for (const version of versions) {
        console.log(`\nTesting ${modelName} on ${version}...`);
        try {
            const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY,
                apiVersion: version
            });
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: "Hello" }]
                    }
                ]
            });
            console.log(`✅ SUCCESS on ${version}!`);
            console.log("Response:", response.text ? response.text.substring(0, 50) + "..." : "No text");
            return;
        } catch (error) {
            console.log(`❌ FAILED on ${version}`);
            if (error.status) console.log(`   Status: ${error.status}`);
            if (error.error && error.error.message) console.log(`   Message: ${error.error.message}`);
        }
    }
}

testVersions();
