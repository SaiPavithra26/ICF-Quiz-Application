import express from "express";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// Submit Quiz
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let score = 0;
    let categories = {};

    quiz.questions.forEach(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) score++;

      if (!categories[q.category]) {
        categories[q.category] = { correct: 0, wrong: 0, total: 0 };
      }

      categories[q.category].total++;
      isCorrect ? categories[q.category].correct++ : categories[q.category].wrong++;
    });

    const attempt = new QuizAttempt({
      userId: req.user.id,
      quizId,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      categoryPerformance: Object.keys(categories).map(key => ({
        category: key,
        ...categories[key],
      })),
    });

    await attempt.save();

    res.json({
      message: "Quiz Stored Successfully",
      score,
      percentage: (score / quiz.questions.length) * 100,
      categoryPerformance: attempt.categoryPerformance,
    });

  } catch (err) {
    console.error("Quiz Submit Error:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

export default router;
