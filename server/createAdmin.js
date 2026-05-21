require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusskillswap');
    
    const adminEmail = 'admin@university.edu';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('\n⚠️  Admin already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      await mongoose.connection.close();
      process.exit(0);
    }
    
    const hashedPassword = await bcryptjs.hash('Admin123', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      studentId: 'ADMIN001',
      password: hashedPassword,
      department: 'Administration',
      skillsOffered: ['Project Management', 'System Administration'],
      skillsLookingFor: ['Any'],
      interests: ['Management', 'System Design'],
      isAdmin: true,
      averageRating: 5.0,
      reputation: 100,
      sessionsCompleted: 50,
      matchesCompleted: 100
    });
    
    await adminUser.save();
    
    console.log('\n✅ ADMIN USER CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: Admin123`);
    console.log(`StudentID: ${adminUser.studentId}`);
    console.log(`Department: ${adminUser.department}`);
    console.log(`Is Admin: ${adminUser.isAdmin}`);
    console.log('═══════════════════════════════════════\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
