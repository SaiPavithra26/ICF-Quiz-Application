const handleFinishQuiz = async () => {
  const token = localStorage.getItem("token");

  try {
    const result = await attemptsAPI.submit(
      {
        quizId: quiz._id,
        answers,   // { "questionID": "A", ... }
      },
      token
    );

    console.log("Quiz submitted:", result);

    navigate("/dashboard");
  } catch (err) {
    console.error("Finish Quiz Error:", err);
    alert("Submission failed");
  }
};
