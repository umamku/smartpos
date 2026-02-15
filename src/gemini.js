// src/gemini.js
// Utility untuk request ke Gemini 1.5 Flash API

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

export async function fetchGeminiAnalysis(transactions) {
  // Format prompt
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

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("Gagal request ke Gemini API");
  const data = await res.json();
  // Gemini response: data.candidates[0].content.parts[0].text
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  try {
    // Try parse JSON from response
    return JSON.parse(text);
  } catch {
    // Fallback: return plain text
    return { summary: text, metrics: [], insight: text, action: "" };
  }
}
