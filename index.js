import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation, audio } = req.body;

    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        // If audio is present, add it to the last user message or as a new turn
        if (audio) {
            contents.push({
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: 'audio/webm',
                            data: audio
                        }
                    },
                    { text: 'Tolong dengarkan bacaan saya di atas dan berikan koreksi jika ada kesalahan tajwid atau pelafalan.' }
                ]
            });
        }

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                systemInstruction: 'Anda adalah seorang guru ngaji Al-Quran yang ahli Tajwid. Tugas Anda adalah menyapa pengguna, menjawab pertanyaan tentang Al-Quran, dan mengoreksi bacaan mereka jika mereka mengirimkan suara. Berikan koreksi yang detail: sebutkan hurufnya, cara baca yang benar, dan hukum tajwidnya. Gunakan huruf Arab, cara baca (transliterasi), dan arti dalam bahasa Indonesia. Gunakan markdown untuk memformat jawabanmu agar rapi dan mudah dibaca.'
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ error: e.message })
    }
});