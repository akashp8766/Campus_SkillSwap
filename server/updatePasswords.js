const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

async function updateAllPasswords() {
  try {
    console.log('🔐 Updating all users passwords to Test123...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-skill-swap');
    console.log('✅ MongoDB connected');

    const hashedPassword = await hashPassword('Test123');

    // Update all users
    const result = await User.updateMany(
      {},
      { $set: { password: hashedPassword } }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} users`);
    console.log(`   All users password: Test123`);

    // Get sample of 20 users
    const sampleUsers = await User.find().sort({ createdAt: -1 }).limit(20).select('-password');

    console.log('\n📋 Sample of 20 users (newest):');
    sampleUsers.forEach((user, idx) => {
      console.log(`\n${idx + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   StudentID: ${user.studentId}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Skills Offered: ${user.skillsOffered.join(', ')}`);
      console.log(`   Rating: ⭐ ${user.averageRating}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateAllPasswords();
