require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeAkashAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusskillswap');
    
    // Find user named Akash Pachauri
    const user = await User.findOne({ name: { $regex: 'Akash Pachauri', $options: 'i' } });
    
    if (!user) {
      console.log('\n❌ User "Akash Pachauri" not found!');
      console.log('Searching for similar names...\n');
      
      const similarUsers = await User.find({ name: { $regex: 'Akash', $options: 'i' } });
      if (similarUsers.length > 0) {
        console.log('Found users with "Akash":');
        similarUsers.forEach(u => {
          console.log(`- ${u.name} (${u.email})`);
        });
      }
      await mongoose.connection.close();
      process.exit(1);
    }
    
    // Make them admin
    user.isAdmin = true;
    await user.save();
    
    console.log('\n✅ ADMIN ROLE GRANTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`StudentID: ${user.studentId}`);
    console.log(`Department: ${user.department}`);
    console.log(`Is Admin: ${user.isAdmin}`);
    console.log(`Password: Test123`);
    console.log('═══════════════════════════════════════\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeAkashAdmin();
