// utils/cerebras.js
import fetch from "node-fetch";

export  async function callCerebras(prompt) {
  try {
    const response = await fetch(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:"llama-3.3-70b", // ✅ correct model name
          messages: [{ role: "user", content: prompt }]
        })
      }
    );

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "No AI answer.";

  } catch (err) {
    console.error("Cerebras API Error:", err);
    return "AI service unavailable.";
  }
};
export default callCerebras;
