import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "General" },
  questions: [
    {
      id: String,
      question: { type: String, required: true },
      optionA: { type: String, required: true },
      optionB: { type: String, required: true },
      optionC: { type: String, required: true },
      optionD: { type: String, required: true },
      correctAnswer: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
      },
      explanation: { type: String, default: "" },
    },
  ],
});

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
