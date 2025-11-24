// ========================================
// frontend/src/api.js
// API Service Layer for Frontend
// ========================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ========================================
// Authentication API
// ========================================
export const authAPI = {
  // User signup
  signup: async (userData) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token and user data
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // User login
  login: async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token and user data
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

// ========================================
// Quiz API
// ========================================
export const quizAPI = {
  // Get all quizzes
  getAllQuizzes: async () => {
    return await apiRequest('/quizzes', {
      method: 'GET',
    });
  },

  // Get single quiz by ID
  getQuizById: async (quizId) => {
    return await apiRequest(`/quizzes/${quizId}`, {
      method: 'GET',
    });
  },

  // Create new quiz (admin only)
  createQuiz: async (quizData) => {
    return await apiRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  // Update quiz (admin only)
  updateQuiz: async (quizId, quizData) => {
    return await apiRequest(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  },

  // Delete quiz (admin only)
  deleteQuiz: async (quizId) => {
    return await apiRequest(`/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }
};

// ========================================
// Quiz Attempt API
// ========================================
export const quizAttemptAPI = {
  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    return await apiRequest('/quiz-attempts', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    });
  },

  // Get user's quiz attempts
  getMyAttempts: async () => {
    return await apiRequest('/quiz-attempts', {
      method: 'GET',
    });
  },

  // Get user statistics
  getStatistics: async () => {
    return await apiRequest('/stats', {
      method: 'GET',
    });
  }
};

// ========================================
// AI Chatbot API
// ========================================



const API_BASE = "http://localhost:5000/api";

export const explanationAPI = {
  async getExplanation(question) {
    const response = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
        question: question.question,      // <-- FIX
        correctAnswer: question.correctAnswer,
        options: {
          optionA: question.optionA,     // <-- FIX
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
        },
    }),
  });
    return response.json();
  },
};

const chatbotBase = `${API_BASE_URL}/chatbot`;
export const chatbotAPI = {
  generalChat: async (message) => {
    const res = await fetch(`${chatbotBase}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      throw new Error("Chatbot request failed");
    }

    const data = await res.json();
    return data.reply;
  }
};
const API_BASE1 = "http://localhost:5000/api/progress";

export const ProgressAPI = {
  saveProgress: async (payload) => {
    const res = await fetch(`${API_BASE1}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.json();
  },

  getStats: async (userId) => {
    const res = await fetch(`${API_BASE1}/${userId}/stats`);
    return res.json();
  },
};


export const attemptsAPI = {
  submit: (data, token) =>
    apiRequest("/api/quiz-attempts", "POST", data, token),

  getStats: (token) =>
    apiRequest("/api/stats", "GET", null, token),
};


// Export all APIs as default
export default {
  auth: authAPI,
  quiz: quizAPI,
  quizAttempt: quizAttemptAPI,
  explanation: explanationAPI,
  chatbot: chatbotAPI,
  attemptsAPI,    
};