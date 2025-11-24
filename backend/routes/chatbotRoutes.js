// routes/chatbotRoutes.js
import express from "express";
import callCerebras from "../utils/cerebras.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call Cerebras
    const aiReply = await callCerebras(
      `You are an AI study assistant. Answer clearly and concisely. Question: ${message}`
    );

    return res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
