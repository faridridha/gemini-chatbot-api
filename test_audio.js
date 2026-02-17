import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

async function testAudio() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = 'gemini-robotics-er-1.5-preview';

    console.log(`Testing audio on ${model}...`);

    // Create a minimal valid base64 audio (1 second silence MP3 or similar, actually just a dummy buffer might fail if validation is strict, 
    // but let's try a very small valid base64 string if possible. 
    // Or just try text-only first to confirm it works with the client instance in this script.)

    // Let's try text first to be 100% sure in this script
    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: "Hello" }] }]
        });
        console.log("Text worked:", result.text.substring(0, 20));
    } catch (e) {
        console.error("Text failed:", e);
        return;
    }

    // Now try with inline data (using a dummy base64 that might be rejected as invalid audio, but checking if the MODEL accepts the mimeType)
    // A tiny 1-byte data might cause a decoding error, but NOT a 404 or "unsupported modality" error hopefully.
    // Better: use a valid 1KB random string and mimeType audio/webm
    const dummyAudio = "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // Minimal WAVE header? No, just base64 junk.
    // Let's use a standard empty wav base64
    // RIFF....WAVEfmt ....data.... 
    // UklGRgAAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA= is a header-only wav.

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { mimeType: 'audio/wav', data: dummyAudio } }, // Using audio/wav for the dummy
                    { text: "Describe this audio." }
                ]
            }]
        });
        console.log("Audio worked:", result.text);
    } catch (e) {
        console.error("Audio failed:", e.message);
        if (e.message.includes('decode') || e.message.includes('valid')) {
            console.log("  (This likely means audio modality IS supported but my dummy data was bad, which is GOOD)");
        } else {
            console.log("  (This might mean audio is NOT supported)");
        }
    }
}

testAudio();
