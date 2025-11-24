// ========================================
// backend/server.js
// Main Express Server for ICF Quiz App
// ========================================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import callCerebras from "./utils/cerebras.js";
import dotenv from "dotenv";
import Quiz from "./models/Quiz.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import explainRoute from "./routes/explain.js";
import quizAttemptRoutes from "./routes/quizAttempts.js";
import progressRoutes from "./routes/progressRoutes.js";
dotenv.config();


const app = express();

// ========================================
// Middleware
// ========================================
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// MongoDB Connection
// ========================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/icf_quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));
app.use("/api/explain", explainRoute);
app.use("/api/progress", progressRoutes);
app.use("/api/chatbot", chatbotRoutes);
// ========================================
// MongoDB Schemas & Models
// ========================================
app.use("/api/quiz-attempts", quizAttemptRoutes);
// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  itiCenter: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Quiz Schema


// Quiz Attempt Schema


// ========================================
// Authentication Middleware
// ========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ========================================
// Auth Routes
// ========================================

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, itiCenter } = req.body;

    // Validate input
    if (!name || !email || !password || !itiCenter) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      itiCenter
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        itiCenter: user.itiCenter,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        itiCenter: user.itiCenter,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ========================================
// Quiz Routes
// ========================================

// Get all quizzes
app.get('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('-__v');
    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get single quiz by ID
app.get('/api/quizzes/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Create new quiz (admin only)
app.post('/api/quizzes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, questions } = req.body;

    if (!title || !description || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title, description, and questions are required' });
    }

    const quiz = new Quiz({
      title,
      description,
      category: category || 'General',
      questions: questions.map((q, index) => ({
        id: q.id || `q${Date.now()}_${index}`,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer
      }))
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update quiz (admin only)
app.put('/api/quizzes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Delete quiz (admin only)
app.delete('/api/quizzes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// ========================================
// Quiz Attempt Routes
// ========================================

// Submit quiz attempt
app.use("/api/quiz-attempts", quizAttemptRoutes);
// Get user's quiz attempts
app.get('/api/quiz-attempts', authenticateToken, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .populate('quizId', 'title description')
      .sort({ completedAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

// Get user's statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id });
    
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    res.json({
      totalAttempts,
      averageScore: averageScore.toFixed(2),
      totalScore,
      totalQuestions
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ========================================
// AI Chatbot Routes (Claude API Integration)
// ========================================

// Explain specific answer
app.post("/api/explain", async (req, res) => {
  console.log("Explain API body:", req.body);

  const { question, correctAnswer, options } = req.body;

  if (!question || !correctAnswer || !options) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const prompt = `
Question: ${question}

Options:
A) ${options.optionA}
B) ${options.optionB}
C) ${options.optionC}
D) ${options.optionD}

Correct Answer: ${correctAnswer}

Explain clearly in 3–4 sentences.
  `;

  const aiResponse = await callCerebras(prompt);
  return res.json({ explanation: aiResponse });
});


// General chat with AI assistant


// ========================================
// Health Check & Root Route
// ========================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'ICF ITI Quiz API Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ========================================
// Error Handling Middleware
// ========================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 ICF ITI Quiz Backend Server');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log('='.repeat(50) + '\n');
});
