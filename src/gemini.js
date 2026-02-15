// src/gemini.js
// Utility untuk request ke Gemini 1.5 Flash API

export async function fetchGeminiAnalysis(transactions) {
  const res = await fetch("http://localhost:3001/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions })
  });
  if (!res.ok) throw new Error("Gagal request ke Gemini API");
  return await res.json();
}
