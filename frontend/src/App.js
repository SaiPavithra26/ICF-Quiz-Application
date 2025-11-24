// ========================================
// frontend/src/App.js
// Main React Application Component
// ========================================

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, LogOut, MessageSquare, Send, X, CheckCircle, Award, User, Lock, Mail, Minimize2, Maximize2 } from 'lucide-react';
import { 
  authAPI, 
  quizAPI, 
  quizAttemptAPI, 
  explanationAPI, 
  chatbotAPI 
} from './api';
import ProgressChart from "./components/ProgressChart";



// ========================================
// Floating AI Chatbot Component
// ========================================
const FloatingChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user.name}! 👋 I'm your AI study assistant. I can help you with:\n• Explaining quiz answers\n• Clarifying doubts on railway topics\n• Study tips for ITI exams\n\nWhat would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotAPI.generalChat(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">AI Study Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[380px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ========================================
// Authentication Page Component
// ========================================
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    itiCenter: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin 
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.signup(formData);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">ICF ITI Quiz</h1>
          <p className="text-gray-600 mt-2">Integral Coach Factory Training Platform</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md transition ${
              isLogin ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md transition ${
              !isLogin ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ITI Center</label>
                <input
                  type="text"
                  required
                  value={formData.itiCenter}
                  onChange={(e) => setFormData({ ...formData, itiCenter: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your ITI Center name"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// Dashboard Component
// ========================================
const Dashboard = ({ user, onLogout, onSelectQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError('Failed to load quizzes. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ICF ITI Quiz</h1>
                <p className="text-xs text-gray-500">Integral Coach Factory</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.itiCenter}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}! 👋</h2>
          <p className="text-gray-600">Choose a quiz to practice for your ITI exams</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quizzes Available</h3>
            <p className="text-gray-500">Please contact your administrator to add quizzes.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div
                key={quiz._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {quiz.questions.length} Questions
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                {quiz.category && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mb-4">
                    {quiz.category}
                  </span>
                )}
                <button
                  onClick={() => onSelectQuiz(quiz)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingChatbot user={user} />
    </div>
  );
};

// ========================================
// Quiz Page Component
// ========================================
const QuizPage = ({ quiz, onBack, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const currentQuestion = quiz.questions[currentIndex];

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
    setShowAnswer(false);
    setExplanation('');
  };

  // Inside your React component

const handleExplain = async () => {
  setExplaining(true);
  setExplanation("");

  try {
    console.log("Sending question:", currentQuestion);

    const data = await explanationAPI.getExplanation(currentQuestion);

    console.log("AI Returned:", data);

    setExplanation(data.explanation || "No explanation generated.");
  } catch (err) {
    console.error("Explain Error:", err);
    setExplanation("Error fetching explanation.");
  } finally {
    setExplaining(false);
  }
};


  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setExplanation('');
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const result = await quizAttemptAPI.submitQuiz(quiz._id, answers);
      setSubmitResult(result);
      setQuizCompleted(true);
    } catch (error) {
      alert('Failed to submit quiz. Please try again.');
    }
  };

if (quizCompleted && submitResult) {
  const percentage = submitResult.percentage || 0;

  
  const categoryResults = submitResult.categoryPerformance || [];

  const weakAreas = categoryResults
    .map(c => ({
      category: c.title,
      accuracy: (c.correct / c.total) * 100
    }))
    .filter(c => c.accuracy < 60);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <Award className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
          <p className="text-gray-600">Great job, {user.name}!</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {percentage.toFixed(0)}%
          </div>
          <p className="text-gray-700 font-medium">
            {submitResult.score} out of {submitResult.totalQuestions} correct
          </p>
        </div>

        {/* PIE CHART */}
        

        {/* WEAK AREAS */}
        <div className="mt-6 text-left">
          <h3 className="text-lg font-bold mb-2">Weak Areas</h3>

          {weakAreas.length === 0 ? (
            <p className="text-green-600">No weak areas 🎉</p>
          ) : (
            weakAreas.map((area, index) => (
              <div key={index} className="p-2 bg-red-100 rounded mb-2">
                ❗ Weak in <strong>{area.category}</strong> – Accuracy:
                {area.accuracy.toFixed(1)}%
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 mt-6">
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setAnswers({});
              setQuizCompleted(false);
              setShowAnswer(false);
              setExplanation('');
              setSubmitResult(null);
            }}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Dashboard
            </button>
            <div className="text-sm text-gray-600">
              Question {currentIndex + 1} of {quiz.questions.length}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Question {currentIndex + 1}</h3>
              <div className="flex space-x-1">
                {quiz.questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentIndex
                        ? 'bg-blue-600'
                        : answers[quiz.questions[idx].id]
                        ? 'bg-green-400'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {['A', 'B', 'C', 'D'].map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                } ${
                  showAnswer && currentQuestion.correctAnswer === option
                    ? 'border-green-500 bg-green-50'
                    : ''
                }`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-semibold text-gray-700 mr-3">
                    {option}
                  </span>
                  <span className="text-gray-800">
                    {currentQuestion[`option${option}`]}
                  </span>
                  {showAnswer && currentQuestion.correctAnswer === option && (
                    <CheckCircle className="ml-auto w-5 h-5 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {explanation && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">AI Explanation:</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{explanation}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showAnswer ? 'Hide Answer' : 'View Answer'}
            </button>
            <button
              onClick={handleExplain}
              disabled={explaining}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              {explaining ? 'Loading...' : 'Explain'}
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      <FloatingChatbot user={user} />
    </div>
  );
};

// ========================================
// Main App Component
// ========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setSelectedQuiz(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (selectedQuiz) {
    return (
      <QuizPage
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
        user={user}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onSelectQuiz={setSelectedQuiz}
    />
  );
}