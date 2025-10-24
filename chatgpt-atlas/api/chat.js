export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { message } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: "Server misconfigured: missing OPENAI_API_KEY" });
  }
  if (!message || typeof message !== "string") {
    return res.status(400).json({ reply: "Invalid request: 'message' (string) is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are ChatGPT Atlas, a helpful AI integrated into a personal web browser UI. Be concise, accurate, and friendly." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No reply";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ reply: "Error: " + error.message });
  }
}
