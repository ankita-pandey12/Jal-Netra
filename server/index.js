import express from 'express';
import cors from 'cors';
import pool from './db.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PORT = 5000;

// Get all tankers
app.get('/api/tankers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tankers');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error fetching tankers' });
    }
});

// AI Query Endpoint (3-Layer Agent)
app.post('/api/query', async (req, res) => {
    const { prompt } = req.body;

    if (!process.env.GROQ_API_KEY) {
        console.error('GROQ_API_KEY is missing!');
        return res.status(500).json({ error: 'System configuration error: API Key missing' });
    }

    try {
        // --- Layer 1: NLP-to-SQL ---
        const l1Response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the JalNetra Data Assistant. Convert user queries into a single valid MySQL SELECT statement.
                    
                    TABLE: tankers
                    COLUMNS:
                    - id (VARCHAR): Unique identifier
                    - capacity (INT): Water volume in liters
                    - status (ENUM): 'AVAILABLE', 'EN-ROUTE', 'UNLOADING', 'MAINTENANCE', 'VERIFIED'
                    - current_village (VARCHAR): Current location
                    - is_secure (BOOLEAN): Security status 1=Secure, 0=Standard
                    
                    RESPONSE FORMAT: Return ONLY the SQL query. Do not include any explanation or Markdown markers.`
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Lower temperature for more consistent SQL
        });

        const l1Content = l1Response.choices[0]?.message?.content?.trim();
        console.log('L1 Raw Output:', l1Content);

        // More robust SQL extraction: find the actual SELECT statement
        let sqlQuery = "";
        const sqlRegex = /SELECT[\s\S]+/i;
        const match = l1Content.match(sqlRegex);

        if (match) {
            sqlQuery = match[0].replace(/```sql|```|`/g, '').split(';')[0].trim();
        }

        console.log('Extracted SQL:', sqlQuery);

        if (!sqlQuery || !sqlQuery.toUpperCase().startsWith('SELECT')) {
            return res.json({
                insight: "I'm sorry, I can only assist with tanker-related data queries. Please ask about tanker status, capacity, or location.",
                query: l1Content,
                data: []
            });
        }

        // --- Layer 2: Secure Executor ---
        const forbiddenWords = ['DROP', 'DELETE', 'UPDATE', 'TRUNCATE', 'ALTER', 'INSERT'];
        if (forbiddenWords.some(word => sqlQuery.toUpperCase().includes(word))) {
            return res.status(403).json({ error: 'Security violation: Unauthorized SQL command detected.' });
        }

        const [rows] = await pool.query(sqlQuery);

        // --- Layer 3: Human Insight ---
        const l3Response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Translate this raw JSON data into a clear, professional update for the Nagpur Collector. Be concise and professional. Persona: JalNetra Intelligence Officer."
                },
                { role: "user", content: `Data: ${JSON.stringify(rows)} \n\nPrompt: ${prompt}` }
            ],
            model: "llama-3.3-70b-versatile",
        });

        res.json({
            insight: l3Response.choices[0]?.message?.content,
            query: sqlQuery,
            data: rows
        });

    } catch (error) {
        console.error('AI Command Center Error:', error);
        res.status(500).json({ error: 'Failed to process AI query', details: error.message });
    }
});

// Allocate a tanker
app.post('/api/allocate', async (req, res) => {
    const { villageName } = req.body;

    try {
        // Find an available tanker
        const [available] = await pool.query('SELECT id FROM tankers WHERE status = "AVAILABLE" LIMIT 1');

        if (available.length === 0) {
            return res.status(400).json({ error: 'No tankers available' });
        }

        const tankerId = available[0].id;
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await pool.query(
            'UPDATE tankers SET status = "EN-ROUTE", assignment = ?, otp = ? WHERE id = ?',
            [villageName, otp, tankerId]
        );

        res.json({ success: true, tankerId, otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error in allocation' });
    }
});

// Verify OTP and update status
app.post('/api/verify', async (req, res) => {
    const { tankerId, otp } = req.body;

    try {
        const [tanker] = await pool.query('SELECT otp FROM tankers WHERE id = ?', [tankerId]);

        if (tanker.length === 0) {
            return res.status(404).json({ error: 'Tanker not found' });
        }

        // Allow actual OTP or '1234' for easier testing/demo
        if (tanker[0].otp === otp || otp === '1234') {
            await pool.query(
                'UPDATE tankers SET status = "AVAILABLE", current_village = assignment, otp = NULL, assignment = NULL WHERE id = ?',
                [tankerId]
            );
            return res.json({ success: true, message: 'OTP Verified. Unloading started.' });
        } else {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error in verification' });
    }
});

app.listen(PORT, () => {
    console.log(`JalNetra Backend running on port ${PORT}`);
});
