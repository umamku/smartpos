require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/gemini', async (req, res) => {
  try {
    const { transactions } = req.body;
    const prompt = `Buatkan analisis penjualan harian dari data berikut:\n${JSON.stringify(transactions)}\n\nBalas dalam format JSON dengan field: summary, metrics (array label & value), insight, action. Bahasa Indonesia.`;
    const body = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { summary: text, metrics: [], insight: text, action: "" };
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Gemini API error', details: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gemini proxy server running on port ${PORT}`);
});
