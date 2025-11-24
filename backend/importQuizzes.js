// ========================================
// backend/importQuizzes.js
// Import Questions from JSON File to MongoDB
// ========================================
// Usage: node importQuizzes.js
// ========================================

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/icf_quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Define Quiz Schema (must match server.js)
const quizSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  questions: [{
    id: String,
    question: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    explanation: { type: String, default: "" }
  }],
  
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Validate quiz data


// Main import function
async function importQuizzes() {
  try {
    console.log('\n🚀 Starting Quiz Import Process...\n');
    
    // Check if JSON file exists
    const jsonPath = path.join(__dirname, 'quizzes.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Error: quizzes.json not found!');
      console.error('📁 Please place your quizzes.json file in the backend folder');
      console.error('📍 Expected location:', jsonPath);
      process.exit(1);
    }
    
    console.log('📂 Reading JSON file...');
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    
    console.log('🔍 Parsing JSON...');
    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('💡 Tip: Validate your JSON at https://jsonlint.com/');
      process.exit(1);
    }
    
    // Validate structure
    if (!jsonData.quizzes || !Array.isArray(jsonData.quizzes)) {
      console.error('❌ Invalid JSON structure!');
      console.error('📋 Expected format: { "quizzes": [ ... ] }');
      process.exit(1);
    }
    
    console.log(`📊 Found ${jsonData.quizzes.length} quizzes\n`);
    
    // Validate each quiz
    
    console.log('✅ Validation passed!\n');
    
    // Ask for confirmation
    console.log('⚠️  This will DELETE all existing quizzes and import new ones.');
    console.log('⏳ Starting import in 3 seconds... (Press Ctrl+C to cancel)\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear existing quizzes
    console.log('🗑️  Clearing existing quizzes...');
    const deleteResult = await Quiz.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} existing quizzes\n`);
    
    // Insert new quizzes
    console.log('💾 Importing new quizzes...');
    const result = await Quiz.insertMany(jsonData.quizzes);
    console.log(`✅ Successfully imported ${result.length} quizzes!\n`);
    
    // Display detailed summary
    console.log('📋 Import Summary:');
    console.log('═'.repeat(60));
    
    let totalQuestions = 0;
    result.forEach((quiz, index) => {
      totalQuestions += quiz.questions.length;
      console.log(`\n${index + 1}. ${quiz.title}`);
      console.log(`   Description: ${quiz.description}`);
      console.log(`   Category: ${quiz.category || 'General'}`);
      console.log(`   Questions: ${quiz.questions.length}`);
      console.log(`   MongoDB ID: ${quiz._id}`);
      
      // Show first question as sample
      if (quiz.questions.length > 0) {
        const firstQ = quiz.questions[0];
        console.log(`   Sample Q: ${firstQ.question.substring(0, 50)}...`);
      }
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 Total Statistics:`);
    console.log(`   • Total Quizzes: ${result.length}`);
    console.log(`   • Total Questions: ${totalQuestions}`);
    console.log(`   • Average Questions per Quiz: ${(totalQuestions / result.length).toFixed(1)}`);
    
    console.log('\n✨ Import completed successfully!');
    console.log('🚀 You can now start your backend server: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Unexpected Error:', error);
    console.error('\n🔍 Debug Information:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    
    console.error('\n💡 Common Solutions:');
    console.error('   1. Ensure MongoDB is running');
    console.error('   2. Check MONGODB_URI in .env file');
    console.error('   3. Validate JSON format at jsonlint.com');
    console.error('   4. Check file permissions');
    
    process.exit(1);
  }
}

// Run the import
importQuizzes();