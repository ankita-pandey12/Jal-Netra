import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

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
                'UPDATE tankers SET status = "VERIFIED", otp = NULL WHERE id = ?',
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
