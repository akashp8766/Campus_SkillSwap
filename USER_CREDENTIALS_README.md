# 🎓 Campus SkillSwap - User Credentials & Test Guide

## ⚡ Quick Facts

- **Total Users**: 124 (52 existing + 72 new)
- **Universal Password**: `Test123`
- **Test Users**: 2 special test accounts for recommendation testing
- **Sample Users**: 20 additional users from the 70 added

---

## 🎯 IMPORTANT TEST USERS (For Recommendation Testing)

### ✅ User A: React Expert (Wants Python)

```
Email: arjun.test.a@university.edu
Password: Test123
StudentID: TEST001
Name: Arjun Sharma
Department: Computer Science
```

**Profile:**
- Skills Offered: React, JavaScript, Node.js ✅
- Skills Looking For: Python, Machine Learning ❌
- Rating: ⭐ 4.8 (15 ratings)
- Reputation: 🏆 35
- Sessions Completed: 12
- Interests: Web Development, Frontend

**Expected Result:** When User A views recommendations, User B should appear with HIGHEST score! 🚀

---

### ✅ User B: Python Expert (Wants React)

```
Email: priya.test.b@university.edu
Password: Test123
StudentID: TEST002
Name: Priya Gupta
Department: Data Science
```

**Profile:**
- Skills Offered: Python, Machine Learning, Data Analysis ✅
- Skills Looking For: React, JavaScript ❌
- Rating: ⭐ 4.9 (18 ratings)
- Reputation: 🏆 42
- Sessions Completed: 14
- Interests: AI, Web Development

**Expected Result:** When User B views recommendations, User A should appear with HIGHEST score! 🚀

---

## 🧪 How to Test Recommendations

### Step 1: Login as User A
```
Email: arjun.test.a@university.edu
Password: Test123
```

### Step 2: Go to Recommendations
```
http://localhost:3000/recommendations
```

### Step 3: View "User Matches" Tab
- Look for "Priya Gupta" in the list
- She should be at the TOP with highest match score
- Why? Because:
  - She offers Python (you want Python) = +5 points
  - You offer React (she wants React) = +3 points
  - Both have excellent ratings = +bonus
  - **Total Score: 8+ (Very High!)** ✅

### Step 4: Check Match Details
- Click on Priya's card
- Should show:
  - Skills They Offer: Python, Machine Learning ✅
  - Skills They Want: React, JavaScript ✅
  - Perfect complementary match! 🎯

---

## 📋 Sample of 20 Users from 70 Added

### User 1: Priya Gupta (TEST USER)
```
Email: priya.test.b@university.edu
StudentID: TEST002
Password: Test123
Department: Data Science
Skills: Python, Machine Learning, Data Analysis
Rating: ⭐ 4.9
```

### User 2: Arjun Sharma (TEST USER)
```
Email: arjun.test.a@university.edu
StudentID: TEST001
Password: Test123
Department: Computer Science
Skills: React, JavaScript, Node.js
Rating: ⭐ 4.8
```

### User 3: Aryan Menon
```
Email: aryan.menon69@university.edu
StudentID: STU100070
Password: Test123
Department: Chemical Engineering
Skills: Figma, Django, UI/UX Design
Rating: ⭐ 3.6
```

### User 4: Neha Srivastava
```
Email: neha.srivastava65@university.edu
StudentID: STU100066
Password: Test123
Department: Mechanical Engineering
Skills: MongoDB, React, JavaScript, Blockchain, Public Speaking, Statistics
Rating: ⭐ 4.2
```

### User 5: Anjali Pandey
```
Email: anjali.pandey68@university.edu
StudentID: STU100069
Password: Test123
Department: Chemical Engineering
Skills: Data Analysis, AWS, Ionic, DevOps, Git
Rating: ⭐ 4.2
```

### User 6: Karan Mukherjee
```
Email: karan.mukherjee67@university.edu
StudentID: STU100068
Password: Test123
Department: Biotechnology
Skills: Content Writing, JavaScript, Cloud Computing
Rating: ⭐ 4.3
```

### User 7: Shreya Bhatt
```
Email: shreya.bhatt66@university.edu
StudentID: STU100067
Password: Test123
Department: Data Science
Skills: Power BI, Photoshop, AWS, GraphQL
Rating: ⭐ 3.6
```

### User 8: Abhishek Nair
```
Email: abhishek.nair64@university.edu
StudentID: STU100065
Password: Test123
Department: Chemical Engineering
Skills: C++, AWS, JIRA, Project Management, REST API
Rating: ⭐ 3.8
```

### User 9: Sonali Das
```
Email: sonali.das55@university.edu
StudentID: STU100056
Password: Test123
Department: Mechanical Engineering
Skills: JavaScript, SQL, Node.js, DevOps, React
Rating: ⭐ 4.7
```

### User 10: Nikhil Patel
```
Email: nikhil.patel54@university.edu
StudentID: STU100055
Password: Test123
Department: Mechanical Engineering
Skills: AWS, Solidity, Swift
Rating: ⭐ 4.3
```

### User 11: Anjali Kapur
```
Email: anjali.kapur52@university.edu
StudentID: STU100053
Password: Test123
Department: Civil Engineering
Skills: Content Writing, Excel, C++
Rating: ⭐ 4.3
```

### User 12: Sneha Pandey
```
Email: sneha.pandey56@university.edu
StudentID: STU100057
Password: Test123
Department: Chemical Engineering
Skills: SEO, MongoDB, Public Speaking, Django
Rating: ⭐ 5.0 (PERFECT!)
```

### User 13: Aryan Tiwari
```
Email: aryan.tiwari57@university.edu
StudentID: STU100058
Password: Test123
Department: Electronics
Skills: Node.js, SQL, JavaScript, Video Editing
Rating: ⭐ 4.6
```

### User 14: Rahul Bhatt
```
Email: rahul.bhatt53@university.edu
StudentID: STU100054
Password: Test123
Department: Business Administration
Skills: Project Management, Python, Django, Web3
Rating: ⭐ 4.8
```

### User 15: Pooja Dwivedi
```
Email: pooja.dwivedi58@university.edu
StudentID: STU100059
Password: Test123
Department: Data Science
Skills: Kubernetes, Python, UI/UX Design, C++, SQL, iOS Development
Rating: ⭐ 4.1
```

### User 16: Meera Desai
```
Email: meera.desai50@university.edu
StudentID: STU100051
Password: Test123
Department: Business Administration
Skills: Networking, SEO, Swift
Rating: ⭐ 5.0 (PERFECT!)
```

### User 17: Ananya Kapur
```
Email: ananya.kapur59@university.edu
StudentID: STU100060
Password: Test123
Department: Mechanical Engineering
Skills: Data Analysis, SEO, Android Development
Rating: ⭐ 4.4
```

### User 18: Veena Mukherjee
```
Email: veena.mukherjee51@university.edu
StudentID: STU100052
Password: Test123
Department: Data Science
Skills: Machine Learning, Ionic, Adobe XD, Public Speaking
Rating: ⭐ 4.3
```

### User 19: Arman Singh
```
Email: arman.singh49@university.edu
StudentID: STU100050
Password: Test123
Department: Mechanical Engineering
Skills: Flutter, JIRA, Java
Rating: ⭐ 4.2
```

### User 20: Veena Bhatt
```
Email: veena.bhatt46@university.edu
StudentID: STU100047
Password: Test123
Department: Chemical Engineering
Skills: C++, Vue.js, Angular, Java
Rating: ⭐ 4.2
```

---

## 🚀 Quick Login Commands

### Test User A (React Expert)
```bash
# Email:
arjun.test.a@university.edu

# Password:
Test123

# Then go to: http://localhost:3000/recommendations
# Check if Priya Gupta appears at TOP ✅
```

### Test User B (Python Expert)
```bash
# Email:
priya.test.b@university.edu

# Password:
Test123

# Then go to: http://localhost:3000/recommendations
# Check if Arjun Sharma appears at TOP ✅
```

---

## 📊 Expected Recommendation Results

### When User A (React) logs in:
```
Tab: User Matches
├── #1 🥇 Priya Gupta (HIGHEST SCORE!)
│   ├── Match Score: 12+
│   ├── Skills: Python, ML, Data Analysis
│   ├── Rating: ⭐ 4.9
│   └── Reason: Perfect complementary match
│
├── #2 Rahul Bhatt
│   ├── Skills: Python, Django, Project Management
│   ├── Rating: ⭐ 4.8
│   └── Match Score: 10
│
└── #3-10 Other Python users...
```

### When User B (Python) logs in:
```
Tab: User Matches
├── #1 🥇 Arjun Sharma (HIGHEST SCORE!)
│   ├── Match Score: 11+
│   ├── Skills: React, JavaScript, Node.js
│   ├── Rating: ⭐ 4.8
│   └── Reason: Perfect complementary match
│
├── #2 Neha Srivastava
│   ├── Skills: MongoDB, React, JavaScript
│   ├── Rating: ⭐ 4.2
│   └── Match Score: 9
│
└── #3-10 Other React users...
```

---

## ✅ Testing Checklist

- [ ] Start app: `npm run dev`
- [ ] Login as User A (Arjun)
- [ ] Go to /recommendations page
- [ ] Check "User Matches" tab
- [ ] Verify Priya Gupta is at TOP with HIGH score
- [ ] Click on Priya's card to see details
- [ ] Logout and login as User B (Priya)
- [ ] Check "User Matches" tab
- [ ] Verify Arjun Sharma is at TOP with HIGH score
- [ ] Check other 18 sample users also show recommendations
- [ ] Test "Skills" tab (should recommend Python to Arjun)
- [ ] Test "Friends" tab
- [ ] Test "Similar Users" tab
- [ ] Test "Popular Skills" tab

---

## 📝 Important Notes

✅ **Password**: All 124 users have password `Test123`
✅ **No Existing Data Lost**: Original 52 users preserved
✅ **New Users**: 72 users added (70 random + 2 test)
✅ **Test Users**: Specifically designed for recommendation testing
✅ **High Ratings**: Users have 3.6-5.0 ratings for realistic data
✅ **Diverse Skills**: 50+ different skills across all users
✅ **Good Reputation**: Reputation scores 10-50 for all users

---

## 🔐 Security Notes

- ⚠️ These are TEST credentials only
- ⚠️ Do NOT use in production
- ⚠️ Password `Test123` is for development only
- ⚠️ All users are dummy/test accounts

---

## 📞 Common Issues

### Q: Priya doesn't show at top of Arjun's matches?
**A:** Make sure both users logged in with Test123 password. App might have cached old data.

### Q: Can't login with the credentials?
**A:** Try clearing browser cache and re-login. Restart server: `npm run dev`

### Q: Recommendations page is empty?
**A:** Verify users have proper skills in database. Check browser console for errors.

### Q: Score is lower than expected?
**A:** Check if the calculation is considering all 6 factors. View browser console for debug info.

---

## 🎉 Success Indicators

When recommendations are working perfectly:

✅ Priya appears at TOP of Arjun's matches
✅ Arjun appears at TOP of Priya's matches
✅ Match scores are 11+ for both
✅ All 5 recommendation tabs show data
✅ Skill recommendations appear
✅ Friend suggestions appear
✅ Popular skills aggregate correctly
✅ Similar users calculate properly

---

## 📚 Additional Resources

- See: `RECOMMENDATION_SYSTEM_GUIDE.md` - Full technical guide
- See: `NO_MODEL_TRAINING_NEEDED.md` - Setup instructions
- See: `QUICK_START.md` - 5-minute quick start
- See: `IMPLEMENTATION_SUMMARY.md` - Implementation overview

---

## 🚀 Start Testing Now!

```powershell
cd CampusSkillSwap
npm run dev
```

Then:
1. Login with: `arjun.test.a@university.edu` / `Test123`
2. Visit: `http://localhost:3000/recommendations`
3. Verify Priya appears with highest match score!
4. Logout and test with Priya's account!

**Enjoy your recommendation system!** 🎊

---

**Last Updated**: May 2, 2026
**Total Users**: 124
**Test Users**: 2 (Arjun + Priya)
**Sample Users**: 20
**Password**: Test123
**Status**: ✅ Ready for Testing
