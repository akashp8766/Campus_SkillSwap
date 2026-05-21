require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function findAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusskillswap');
    
    const admins = await User.find({ isAdmin: true }).select('name email studentId isAdmin');
    
    console.log('\n👨‍💼 ADMIN USERS');
    console.log('═══════════════════════════════════════');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database');
    } else {
      admins.forEach((admin, idx) => {
        console.log(`\n${idx + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   StudentID: ${admin.studentId}`);
        console.log(`   Admin: ${admin.isAdmin}`);
      });
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log(`Total Admins: ${admins.length}`);
    console.log('═══════════════════════════════════════\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findAdmin();
