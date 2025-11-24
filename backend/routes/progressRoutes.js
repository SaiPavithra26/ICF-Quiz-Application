import express from "express";
import QuizAttempt from "../models/QuizAttempt.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  try {
    const {
      userId,
      quizId, 
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      categoryResults,
    } = req.body;

    const attempt = await QuizAttempt.create({
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      categoryResults,
    });

    return res.json({ success: true, attempt });
  } catch (err) {
    console.error("Save Progress Error:", err);
    return res.status(500).json({ error: "Failed to save progress" });
  }
});
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const attempts = await QuizAttempt.find({ userId });

    if (!attempts.length) {
      return res.json({ success: true, attempts: [], weakAreas: [] });
    }

    const categoryTotals = {};

    attempts.forEach(attempt => {
      attempt.categoryResults.forEach(c => {
        if (!categoryTotals[c.category]) {
          categoryTotals[c.category] = { total: 0, correct: 0 };
        }
        categoryTotals[c.category].total += c.total;
        categoryTotals[c.category].correct += c.correct;
      });
    });

    const weakAreas = Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        accuracy: (data.correct / data.total) * 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3); // Top 3 weakest categories

    return res.json({
      success: true,
      attempts,
      weakAreas,
    });

  } catch (err) {
    console.error("Stats Error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
