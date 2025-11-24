// backend/routes/explain.js
import express from "express";
import callCerebras from "../utils/cerebras.js";

const router = express.Router();

// POST /api/explain
router.post("/", async (req, res) => {
  try {
    console.log("Explain API body:", req.body);

    const { question, correctAnswer, options } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question text received" });
    }

    const prompt = `
You are an instructor at Integral Coach Factory.

Question:
${question}

Options:
A) ${options.optionA}
B) ${options.optionB}
C) ${options.optionC}
D) ${options.optionD}

Correct Answer: ${correctAnswer}

Explain in 3–4 simple sentences suitable for ITI students, related to manufacturing and railway safety.
`.trim();

    console.log("Calling Cerebras AI…");

    const explanation = await callCerebras(prompt);

    res.json({ explanation });

  } catch (error) {
    console.error("Explain Route Error:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

export default router;
