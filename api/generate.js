// api/generate.js
export const config = { runtime: 'edge' };

/**
 * Vercel Serverless function
 * Env required: OPENAI_API_KEY
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const { prompt, tone = "inspirational", length = "short" } = body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Build system / user messages to steer model
    const systemMsg = {
      role: "system",
      content: "You are a friendly, concise motivation coach. Keep messages uplifting and actionable."
    };

    const userMsg = {
      role: "user",
      content: `Buatkan teks motivasi ${tone}. Tampilkan 1 paragraf pendek (2-4 kalimat). Prompt: ${prompt}. Panjang: ${length}.`
    };

    // Call OpenAI Chat Completions endpoint
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // bisa diganti sesuai akses
        messages: [systemMsg, userMsg],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("OpenAI error:", errText);
      return res.status(502).json({ error: "OpenAI error", details: errText });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? "";

    return res.status(200).json({ result: text, raw: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
