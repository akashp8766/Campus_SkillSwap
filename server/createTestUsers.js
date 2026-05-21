const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

async function createTestUsers() {
  try {
    console.log('🧪 Starting Test Users Creation...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-skill-swap');
    console.log('✅ MongoDB connected');

    // Hash Test123 password
    const hashedPassword = await hashPassword('Test123');

    // User A: offers React, wants Python
    const userA = {
      name: 'Arjun Sharma',
      studentId: 'TEST001',
      email: 'arjun.test.a@university.edu',
      password: hashedPassword,
      skillsOffered: ['React', 'JavaScript', 'Node.js'],
      skillsLookingFor: ['Python', 'Machine Learning'],
      bio: 'Expert in React and JavaScript. Looking to learn Python and ML!',
      isAdmin: false,
      department: 'Computer Science',
      interests: ['Web Development', 'Frontend'],
      averageRating: 4.8,
      totalRatings: 15,
      reputation: 35,
      sessionsCompleted: 12,
      matchesCompleted: 8,
      profileViews: 65,
      searchHistory: ['Python', 'Django'],
      friends: []
    };

    // User B: offers Python, wants React
    const userB = {
      name: 'Priya Gupta',
      studentId: 'TEST002',
      email: 'priya.test.b@university.edu',
      password: hashedPassword,
      skillsOffered: ['Python', 'Machine Learning', 'Data Analysis'],
      skillsLookingFor: ['React', 'JavaScript'],
      bio: 'Python and ML expert. Interested in learning React and modern web dev!',
      isAdmin: false,
      department: 'Data Science',
      interests: ['AI', 'Web Development'],
      averageRating: 4.9,
      totalRatings: 18,
      reputation: 42,
      sessionsCompleted: 14,
      matchesCompleted: 9,
      profileViews: 78,
      searchHistory: ['React', 'JavaScript'],
      friends: []
    };

    // Check if test users already exist
    const existingA = await User.findOne({ email: userA.email });
    const existingB = await User.findOne({ email: userB.email });

    if (existingA) {
      console.log('⚠️  User A already exists, updating...');
      await User.findByIdAndUpdate(existingA._id, userA);
    } else {
      await User.create(userA);
      console.log('✅ User A created');
    }

    if (existingB) {
      console.log('⚠️  User B already exists, updating...');
      await User.findByIdAndUpdate(existingB._id, userB);
    } else {
      await User.create(userB);
      console.log('✅ User B created');
    }

    console.log('\n🎯 Test Users Ready:');
    console.log('\n📌 USER A (React Expert):');
    console.log('   Email: arjun.test.a@university.edu');
    console.log('   Password: Test123');
    console.log('   Skills Offered: React, JavaScript, Node.js');
    console.log('   Skills Looking: Python, Machine Learning');
    console.log('   Rating: ⭐ 4.8 (15 ratings)');
    console.log('   Reputation: 🏆 35');

    console.log('\n📌 USER B (Python Expert):');
    console.log('   Email: priya.test.b@university.edu');
    console.log('   Password: Test123');
    console.log('   Skills Offered: Python, Machine Learning, Data Analysis');
    console.log('   Skills Looking: React, JavaScript');
    console.log('   Rating: ⭐ 4.9 (18 ratings)');
    console.log('   Reputation: 🏆 42');

    console.log('\n✅ Test users ready! Both should match highly!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();
