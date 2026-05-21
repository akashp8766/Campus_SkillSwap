const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Indian first names and last names for realistic data
const indianFirstNames = [
  'Aarav', 'Arjun', 'Aditya', 'Vikram', 'Rohan', 'Karan', 'Nikhil', 'Rajesh',
  'Amit', 'Priya', 'Neha', 'Ananya', 'Divya', 'Anjali', 'Shreya', 'Pooja',
  'Aryan', 'Harsh', 'Akshay', 'Rahul', 'Varun', 'Ashok', 'Deepak', 'Naveen',
  'Suresh', 'Ramesh', 'Sanjay', 'Vinay', 'Tanvi', 'Sonali', 'Ritika', 'Kavya',
  'Sandhya', 'Sneha', 'Isha', 'Meera', 'Lakshmi', 'Sarita', 'Smita', 'Veena',
  'Rajiv', 'Manoj', 'Pavan', 'Arman', 'Dhruv', 'Aman', 'Ishaan', 'Vivek',
  'Abhishek', 'Sandeep', 'Mohit', 'Rishi', 'Veer', 'Nitin', 'Jatin', 'Sumit'
];

const indianLastNames = [
  'Sharma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Nair', 'Rao', 'Pillai',
  'Iyer', 'Choudhury', 'Verma', 'Yadav', 'Srivastava', 'Pandey', 'Mishra',
  'Tiwari', 'Dwivedi', 'Tripathi', 'Trivedi', 'Chakraborty', 'Banerjee',
  'Mukherjee', 'Das', 'Desai', 'Shah', 'Joshi', 'Bhatt', 'Malhotra', 'Arora',
  'Kapur', 'Chopra', 'Bhat', 'Hegde', 'Krishnan', 'Menon', 'Arun', 'Reddy',
  'Rao', 'Bhaskar', 'Kulkarni', 'More', 'Kadam', 'Jadhav'
];

const skillsPool = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Django',
  'Machine Learning', 'Data Analysis', 'SQL', 'MongoDB', 'Cloud Computing',
  'AWS', 'Docker', 'Kubernetes', 'Angular', 'Vue.js', 'Spring Boot',
  'TypeScript', 'GraphQL', 'REST API', 'Mobile Development', 'Flutter',
  'Ionic', 'Android Development', 'iOS Development', 'Swift', 'Kotlin',
  'Blockchain', 'Web3', 'Smart Contracts', 'Solidity', 'DevOps',
  'Git', 'GitHub', 'Linux', 'Windows Server', 'Networking',
  'Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'Design Thinking',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Video Editing',
  'Adobe Premiere', 'Public Speaking', 'Content Writing', 'SEO',
  'Digital Marketing', 'Excel', 'Power BI', 'Tableau', 'Statistics',
  'Agile Methodology', 'Project Management', 'JIRA', 'Scrum'
];

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Data Science',
  'Business Administration'
];

const interests = [
  'Web Development', 'Mobile Apps', 'Artificial Intelligence', 'Data Science',
  'Cloud Computing', 'DevOps', 'Cybersecurity', 'Blockchain', 'IoT',
  'Machine Learning', 'Deep Learning', 'Robotics', 'Game Development',
  'Graphics Programming', 'UI/UX Design', 'Digital Marketing', 'Entrepreneurship',
  'Leadership', 'Innovation', 'Research', 'Open Source', 'Competitive Programming',
  'System Design', 'Database Design', 'Software Architecture', 'Testing',
  'Performance Optimization', 'Scalability', 'Microservices'
];

// Function to get random items
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Function to generate random password hash
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

// Function to generate 70 dummy users
async function seedUsers() {
  try {
    console.log('🌱 Starting seed process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-skill-swap');
    console.log('✅ MongoDB connected');

    // Get existing user count
    const existingCount = await User.countDocuments();
    console.log(`📊 Existing users: ${existingCount}`);

    const usersToCreate = [];

    // Generate 70 diverse users
    for (let i = 0; i < 70; i++) {
      const firstName = getRandomItem(indianFirstNames);
      const lastName = getRandomItem(indianLastNames);
      const name = `${firstName} ${lastName}`;
      
      const studentId = `STU${String(100000 + i + 1).slice(-6)}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`;

      // Password: default123
      const hashedPassword = await hashPassword('default123');

      // Random skills for diversity
      const skillsOffered = getRandomItems(skillsPool, getRandomInt(3, 6));
      const skillsLookingFor = getRandomItems(skillsPool, getRandomInt(2, 5));
      
      // Make sure looking for skills are different from offered
      const filteredLooking = skillsLookingFor.filter(s => !skillsOffered.includes(s));
      
      // Random department and interests
      const department = getRandomItem(departments);
      const userInterests = getRandomItems(interests, getRandomInt(2, 4));

      // Good ratings and reputation for better recommendations
      const averageRating = getRandomFloat(3.5, 5.0);
      const totalRatings = getRandomInt(5, 20);
      const reputation = getRandomInt(10, 50);
      const sessionsCompleted = getRandomInt(3, 15);
      const matchesCompleted = getRandomInt(2, 10);
      const profileViews = getRandomInt(10, 100);

      usersToCreate.push({
        name,
        studentId,
        email,
        password: hashedPassword,
        skillsOffered,
        skillsLookingFor: filteredLooking,
        bio: `Hi! I'm ${firstName}, interested in ${userInterests.join(', ')}. Always ready to learn and help others!`,
        isAdmin: false,
        department,
        interests: userInterests,
        averageRating,
        totalRatings,
        reputation,
        sessionsCompleted,
        matchesCompleted,
        profileViews,
        searchHistory: getRandomItems(skillsPool, getRandomInt(0, 3)),
        friends: []
      });
    }

    // Insert all users (without skipping duplicates, using insertMany)
    const result = await User.insertMany(usersToCreate, { ordered: false }).catch(err => {
      // If some insertions fail due to duplicate email/studentId, continue with successful ones
      console.warn('⚠️  Some users may have duplicate emails/IDs (skipped), continuing...');
      return err.result;
    });

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`📈 Total users in database: ${await User.countDocuments()}`);
    console.log(`➕ Users added in this session: ${result.insertedIds ? result.insertedIds.length : usersToCreate.length}`);
    
    // Show sample of created users
    console.log('\n📋 Sample of created users:');
    const samples = await User.find().sort({ createdAt: -1 }).limit(5);
    samples.forEach((user, idx) => {
      console.log(`\n${idx + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Skills Offered: ${user.skillsOffered.join(', ')}`);
      console.log(`   Skills Looking: ${user.skillsLookingFor.join(', ')}`);
      console.log(`   Rating: ⭐ ${user.averageRating} (${user.totalRatings} ratings)`);
      console.log(`   Reputation: 🏆 ${user.reputation}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seedUsers();
