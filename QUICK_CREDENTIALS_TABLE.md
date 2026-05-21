# 🔐 All User Credentials - Quick Reference Table

> **All Users Password**: `Test123`

---

## 🎯 TEST USERS (2) - For Recommendation Testing

| # | Name | Email | StudentID | Department | Rating | Reputation |
|---|------|-------|-----------|-----------|--------|-----------|
| 1️⃣ | **Arjun Sharma** (Wants Python) | `arjun.test.a@university.edu` | TEST001 | Computer Science | ⭐ 4.8 | 🏆 35 |
| 2️⃣ | **Priya Gupta** (Wants React) | `priya.test.b@university.edu` | TEST002 | Data Science | ⭐ 4.9 | 🏆 42 |

**Skills Offered:**
- User A: React, JavaScript, Node.js
- User B: Python, Machine Learning, Data Analysis

**Perfect Match! Both should recommend each other at #1! ✅**

---

## 📋 SAMPLE USERS (20) - From 70 Newly Added

| # | Name | Email | StudentID | Department | Rating | Reputation |
|---|------|-------|-----------|-----------|--------|-----------|
| 3 | Aryan Menon | `aryan.menon69@university.edu` | STU100070 | Chemical Engineering | ⭐ 3.6 | 🏆 28 |
| 4 | Neha Srivastava | `neha.srivastava65@university.edu` | STU100066 | Mechanical Engineering | ⭐ 4.2 | 🏆 17 |
| 5 | Anjali Pandey | `anjali.pandey68@university.edu` | STU100069 | Chemical Engineering | ⭐ 4.2 | 🏆 39 |
| 6 | Karan Mukherjee | `karan.mukherjee67@university.edu` | STU100068 | Biotechnology | ⭐ 4.3 | 🏆 14 |
| 7 | Shreya Bhatt | `shreya.bhatt66@university.edu` | STU100067 | Data Science | ⭐ 3.6 | 🏆 15 |
| 8 | Abhishek Nair | `abhishek.nair64@university.edu` | STU100065 | Chemical Engineering | ⭐ 3.8 | 🏆 47 |
| 9 | Sonali Das | `sonali.das55@university.edu` | STU100056 | Mechanical Engineering | ⭐ 4.7 | 🏆 31 |
| 10 | Nikhil Patel | `nikhil.patel54@university.edu` | STU100055 | Mechanical Engineering | ⭐ 4.3 | 🏆 24 |
| 11 | Anjali Kapur | `anjali.kapur52@university.edu` | STU100053 | Civil Engineering | ⭐ 4.3 | 🏆 22 |
| 12 | Sneha Pandey | `sneha.pandey56@university.edu` | STU100057 | Chemical Engineering | ⭐ 5.0 | 🏆 50 |
| 13 | Aryan Tiwari | `aryan.tiwari57@university.edu` | STU100058 | Electronics | ⭐ 4.6 | 🏆 35 |
| 14 | Rahul Bhatt | `rahul.bhatt53@university.edu` | STU100054 | Business Administration | ⭐ 4.8 | 🏆 29 |
| 15 | Pooja Dwivedi | `pooja.dwivedi58@university.edu` | STU100059 | Data Science | ⭐ 4.1 | 🏆 38 |
| 16 | Meera Desai | `meera.desai50@university.edu` | STU100051 | Business Administration | ⭐ 5.0 | 🏆 44 |
| 17 | Ananya Kapur | `ananya.kapur59@university.edu` | STU100060 | Mechanical Engineering | ⭐ 4.4 | 🏆 41 |
| 18 | Veena Mukherjee | `veena.mukherjee51@university.edu` | STU100052 | Data Science | ⭐ 4.3 | 🏆 19 |
| 19 | Arman Singh | `arman.singh49@university.edu` | STU100050 | Mechanical Engineering | ⭐ 4.2 | 🏆 26 |
| 20 | Veena Bhatt | `veena.bhatt46@university.edu` | STU100047 | Chemical Engineering | ⭐ 4.2 | 🏆 33 |
| 21 | Sumit Patel | `sumit.patel48@university.edu` | STU100049 | IT | ⭐ 4.5 | 🏆 37 |
| 22 | Rishi Verma | `rishi.verma45@university.edu` | STU100046 | Electronics | ⭐ 4.7 | 🏆 48 |

---

## 🔑 Master Credentials

```
🎯 LOGIN CREDENTIALS FOR ALL USERS
═══════════════════════════════════════

TEST USERS (Perfect Match):
  User A: arjun.test.a@university.edu / Test123
  User B: priya.test.b@university.edu / Test123

SAMPLE USERS (20 from 70):
  All use: Your Email / Test123

TOTAL IN DATABASE:
  - 2 Test Users (Created specifically for this)
  - 70 New Random Users (Indian names, diverse skills)
  - 52 Existing Users (Original data preserved)
  ══════════════════
  124 Total Users ✅

DEFAULT PASSWORD: Test123
```

---

## 📱 Login URLs

```
Frontend: http://localhost:3000
Backend: http://localhost:5000

Login Page: http://localhost:3000/login
Recommendations: http://localhost:3000/recommendations
Profile: http://localhost:3000/profile
```

---

## 🎯 Test Case Quick Links

| Test | User A Email | User B Email | Expected Result |
|------|-------------|-------------|---|
| **Recommendation Match** | `arjun.test.a@university.edu` | `priya.test.b@university.edu` | User B at #1 in User A's matches ✅ |
| **Skills Tab** | `arjun.test.a@university.edu` | - | Python recommended |
| **Friends Tab** | `arjun.test.a@university.edu` | - | Similar users suggested |
| **Popular Skills** | Any user | - | Python, React, JavaScript trending |
| **Similar Users** | `arjun.test.a@university.edu` | - | Similar profile users found |

---

## 💡 Quick Tips

### Copy-Paste Ready Credentials

```
Email: arjun.test.a@university.edu
Password: Test123
```

```
Email: priya.test.b@university.edu
Password: Test123
```

### Browser Console Check
```javascript
// After login, paste in console to see token
localStorage.getItem('token')

// Should return a JWT token
```

### Check User ID
```javascript
// In console after login
localStorage.getItem('userId')
// Use this to view recommendations API
// http://localhost:5000/api/recommend/matches/{userId}
```

---

## 🧪 Testing Progression

### Level 1: Basic Auth Test
```
✅ Login with arjun.test.a@university.edu
✅ Login with priya.test.b@university.edu
✅ Both should succeed
```

### Level 2: Profile Viewing
```
✅ View personal profile
✅ Check skills are populated
✅ Check ratings visible
```

### Level 3: Recommendations
```
✅ Visit /recommendations page
✅ View all 5 tabs loading
✅ See users, skills, friends appearing
```

### Level 4: Match Verification
```
✅ User A sees User B in matches
✅ User B sees User A in matches
✅ Both appear with HIGH scores (30+)
```

### Level 5: Data Verification
```
✅ Check MongoDB has all 124 users
✅ Verify passwords are hashed Test123
✅ Confirm skills are diverse
✅ Validate ratings are 3.5-5.0
```

---

## 📊 Database Stats

```
Total Users Created: 124
├── Test Users: 2 (Arjun + Priya)
├── New Random Users: 70
└── Existing Users: 52 (preserved)

Skills Count: 50+ different
Departments: 10 different
Rating Range: 3.5 - 5.0 ⭐
Reputation Range: 10 - 50 🏆

Password Hash: bcrypt (Test123)
Database: MongoDB campus-skill-swap
```

---

## ✅ Pre-Testing Checklist

- [ ] MongoDB running locally
- [ ] Backend server started (`npm run dev` in server folder)
- [ ] Frontend running (`npm start` in client folder)
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000
- [ ] User credentials verified above
- [ ] Test123 password ready
- [ ] Browser cookies/cache cleared

---

## 🚀 Start Testing Now!

```bash
# 1. Terminal 1: Start backend
cd server
npm run dev

# 2. Terminal 2: Start frontend
cd client
npm start

# 3. Browser: Go to http://localhost:3000
# 4. Login with: arjun.test.a@university.edu / Test123
# 5. Navigate to: /recommendations
# 6. Verify Priya appears at #1 ✅
```

---

## 📞 Support

Need help?
- See: `USER_CREDENTIALS_README.md` (Detailed guide with all 20 users)
- See: `TEST_CASE_GUIDE.md` (Test case walkthrough)
- See: `RECOMMENDATION_SYSTEM_GUIDE.md` (Technical details)

---

**Status**: ✅ All Users Created
**Password**: Test123 (Universal)
**Test Users**: 2 Perfect Match Pair
**Sample Users**: 20 (from 70 added)
**Total Users**: 124 in Database
**Ready to Test**: YES ✅
