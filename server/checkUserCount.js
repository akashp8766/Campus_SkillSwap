require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusskillswap');
    
    const totalCount = await User.countDocuments();
    const testUsers = await User.countDocuments({ studentId: { $regex: '^TEST' } });
    const regularUsers = totalCount - testUsers;
    
    console.log('\n📊 USER COUNT SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total Users: ${totalCount}`);
    console.log(`├─ Test Users: ${testUsers}`);
    console.log(`└─ Regular Users: ${regularUsers}`);
    console.log('═══════════════════════════════════════\n');

    // Show first 5 users
    const firstUsers = await User.find().limit(5).select('name email studentId');
    console.log('First 5 Users:');
    firstUsers.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name} (${user.email})`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
