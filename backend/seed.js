// ========================================
// backend/seed.js
// Database Seeding Script
// Run: node seed.js
// ========================================

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/icf_quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected for seeding'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Quiz Schema (must match server.js)
const quizSchema = new mongoose.Schema({
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
    correctAnswer: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Sample Quiz Data for ICF ITI Students
const sampleQuizzes = [
  {
    title: 'Railway Safety Fundamentals',
    description: 'Essential safety protocols for railway operations and coach manufacturing',
    category: 'Safety',
    questions: [
      {
        id: 'safety_q1',
        question: 'What is the minimum safe distance from the platform edge when a train is approaching?',
        optionA: '1 meter',
        optionB: '2 meters',
        optionC: '3 meters',
        optionD: '4 meters',
        correctAnswer: 'B'
      },
      {
        id: 'safety_q2',
        question: 'Which safety equipment is mandatory for workers in the coach factory?',
        optionA: 'Safety helmet only',
        optionB: 'Safety shoes only',
        optionC: 'Both helmet and shoes',
        optionD: 'Gloves only',
        correctAnswer: 'C'
      },
      {
        id: 'safety_q3',
        question: 'What should you do if you see a fire in the workshop?',
        optionA: 'Continue working',
        optionB: 'Sound the alarm and evacuate',
        optionC: 'Try to extinguish it alone',
        optionD: 'Ignore it',
        correctAnswer: 'B'
      },
      {
        id: 'safety_q4',
        question: 'What does the red signal indicate in railway operations?',
        optionA: 'Proceed with caution',
        optionB: 'Stop immediately',
        optionC: 'Slow down',
        optionD: 'Normal speed',
        correctAnswer: 'B'
      },
      {
        id: 'safety_q5',
        question: 'What is the primary purpose of lockout/tagout procedures?',
        optionA: 'To save energy',
        optionB: 'To prevent accidental startup of machinery',
        optionC: 'To reduce noise',
        optionD: 'To increase speed',
        correctAnswer: 'B'
      }
    ]
  },
  {
    title: 'Workshop Tools & Equipment',
    description: 'Understanding basic workshop tools used in railway coach manufacturing',
    category: 'Technical',
    questions: [
      {
        id: 'tools_q1',
        question: 'What is a torque wrench primarily used for?',
        optionA: 'Cutting metal sheets',
        optionB: 'Tightening bolts to specific torque',
        optionC: 'Measuring length accurately',
        optionD: 'Welding metal parts',
        correctAnswer: 'B'
      },
      {
        id: 'tools_q2',
        question: 'Which tool is used for precision measurement in workshop?',
        optionA: 'Hammer',
        optionB: 'Vernier caliper',
        optionC: 'Screwdriver',
        optionD: 'Pliers',
        correctAnswer: 'B'
      },
      {
        id: 'tools_q3',
        question: 'What is the accuracy of a standard vernier caliper?',
        optionA: '0.1 mm',
        optionB: '0.02 mm',
        optionC: '1 mm',
        optionD: '0.5 mm',
        correctAnswer: 'B'
      },
      {
        id: 'tools_q4',
        question: 'Which tool is used for cutting internal threads?',
        optionA: 'Die',
        optionB: 'Tap',
        optionC: 'Reamer',
        optionD: 'Drill',
        correctAnswer: 'B'
      },
      {
        id: 'tools_q5',
        question: 'What is a micrometer used for?',
        optionA: 'Measuring very small distances',
        optionB: 'Measuring angles',
        optionC: 'Measuring temperature',
        optionD: 'Measuring voltage',
        correctAnswer: 'A'
      }
    ]
  },
  {
    title: 'Electrical Systems in Trains',
    description: 'Basic electrical concepts for railway coaches',
    category: 'Electrical',
    questions: [
      {
        id: 'elec_q1',
        question: 'What is the standard voltage for Indian Railway coaches?',
        optionA: '110V DC',
        optionB: '220V AC',
        optionC: '110V DC / 750V DC',
        optionD: '440V AC',
        correctAnswer: 'C'
      },
      {
        id: 'elec_q2',
        question: 'What does MCB stand for in electrical systems?',
        optionA: 'Main Circuit Board',
        optionB: 'Miniature Circuit Breaker',
        optionC: 'Maximum Current Barrier',
        optionD: 'Multiple Connection Box',
        correctAnswer: 'B'
      },
      {
        id: 'elec_q3',
        question: 'What is the purpose of a battery in a railway coach?',
        optionA: 'Emergency lighting only',
        optionB: 'Air conditioning',
        optionC: 'Emergency lighting and essential services',
        optionD: 'Engine starting',
        correctAnswer: 'C'
      },
      {
        id: 'elec_q4',
        question: 'Which type of current is used for traction in electric trains?',
        optionA: 'AC only',
        optionB: 'DC only',
        optionC: 'Both AC and DC',
        optionD: 'Neither AC nor DC',
        correctAnswer: 'C'
      }
    ]
  },
  {
    title: 'Welding and Fabrication',
    description: 'Welding techniques used in coach manufacturing',
    category: 'Technical',
    questions: [
      {
        id: 'weld_q1',
        question: 'What does MIG welding stand for?',
        optionA: 'Manual Inert Gas',
        optionB: 'Metal Inert Gas',
        optionC: 'Magnetic Inert Gas',
        optionD: 'Molten Inert Gas',
        correctAnswer: 'B'
      },
      {
        id: 'weld_q2',
        question: 'Which gas is commonly used in TIG welding?',
        optionA: 'Oxygen',
        optionB: 'Carbon dioxide',
        optionC: 'Argon',
        optionD: 'Nitrogen',
        correctAnswer: 'C'
      },
      {
        id: 'weld_q3',
        question: 'What is the main advantage of spot welding?',
        optionA: 'Very slow process',
        optionB: 'Quick and efficient for joining thin sheets',
        optionC: 'Requires no electricity',
        optionD: 'Can weld very thick materials',
        correctAnswer: 'B'
      },
      {
        id: 'weld_q4',
        question: 'What protective equipment is essential for welding?',
        optionA: 'Safety glasses only',
        optionB: 'Welding helmet with proper shade',
        optionC: 'Regular sunglasses',
        optionD: 'No protection needed',
        correctAnswer: 'B'
      }
    ]
  },
  {
    title: 'ICF Manufacturing Process',
    description: 'Understanding the coach manufacturing process at ICF',
    category: 'Manufacturing',
    questions: [
      {
        id: 'icf_q1',
        question: 'What does ICF stand for?',
        optionA: 'Indian Coach Factory',
        optionB: 'Integral Coach Factory',
        optionC: 'International Coach Factory',
        optionD: 'Industrial Coach Factory',
        correctAnswer: 'B'
      },
      {
        id: 'icf_q2',
        question: 'In which city is ICF located?',
        optionA: 'Mumbai',
        optionB: 'Delhi',
        optionC: 'Chennai',
        optionD: 'Kolkata',
        correctAnswer: 'C'
      },
      {
        id: 'icf_q3',
        question: 'What is the main material used for coach body construction?',
        optionA: 'Wood',
        optionB: 'Stainless steel',
        optionC: 'Plastic',
        optionD: 'Aluminum',
        correctAnswer: 'B'
      },
      {
        id: 'icf_q4',
        question: 'What is the shell-less construction method called?',
        optionA: 'Conventional construction',
        optionB: 'Monocoque construction',
        optionC: 'Frame construction',
        optionD: 'Box construction',
        correctAnswer: 'B'
      }
    ]
  },
  {
    title: 'Quality Control in Manufacturing',
    description: 'Quality assurance and control procedures',
    category: 'Quality Control',
    questions: [
      {
        id: 'qc_q1',
        question: 'What does NDT stand for in quality control?',
        optionA: 'New Design Testing',
        optionB: 'Non-Destructive Testing',
        optionC: 'Normal Development Testing',
        optionD: 'National Design Technology',
        correctAnswer: 'B'
      },
      {
        id: 'qc_q2',
        question: 'Which NDT method uses sound waves?',
        optionA: 'X-ray testing',
        optionB: 'Magnetic particle testing',
        optionC: 'Ultrasonic testing',
        optionD: 'Dye penetrant testing',
        correctAnswer: 'C'
      },
      {
        id: 'qc_q3',
        question: 'What is the tolerance in manufacturing?',
        optionA: 'Acceptable deviation from standard',
        optionB: 'Maximum weight',
        optionC: 'Minimum length',
        optionD: 'Standard color',
        correctAnswer: 'A'
      }
    ]
  }
];

// Main seed function
async function seedDatabase() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 Starting Database Seeding Process');
    console.log('='.repeat(60) + '\n');

    // Clear existing quizzes
    console.log('🗑️  Clearing existing quizzes...');
    const deleteResult = await Quiz.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} existing quizzes\n`);

    // Insert sample quizzes
    console.log('💾 Inserting sample quizzes...');
    const insertedQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`   ✅ Successfully inserted ${insertedQuizzes.length} quizzes\n`);

    // Display detailed summary
    console.log('📋 Seeding Summary:');
    console.log('='.repeat(60));
    
    let totalQuestions = 0;
    insertedQuizzes.forEach((quiz, index) => {
      totalQuestions += quiz.questions.length;
      console.log(`\n${index + 1}. ${quiz.title}`);
      console.log(`   Category: ${quiz.category}`);
      console.log(`   Questions: ${quiz.questions.length}`);
      console.log(`   Description: ${quiz.description.substring(0, 50)}...`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Statistics:');
    console.log(`   Total Quizzes: ${insertedQuizzes.length}`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Average Questions per Quiz: ${(totalQuestions / insertedQuizzes.length).toFixed(1)}`);
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('🚀 You can now start your server: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

// ========================================
// Usage Instructions
// ========================================
/*
SETUP:
1. Make sure MongoDB is running
2. Create .env file with MONGODB_URI
3. Run: npm install mongoose dotenv

RUN:
node seed.js

EXPECTED OUTPUT:
✅ Successfully inserted X quizzes

TROUBLESHOOTING:
- If MongoDB connection fails, check if MongoDB service is running
- If seed fails, check MongoDB URI in .env file
- To re-seed, just run the script again (it clears old data first)
*/