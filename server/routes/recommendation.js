const express = require("express");
const router = express.Router();
const User = require("../models/User");
const matchScore = require("../recommendation/matchScore");
const skillRecommend = require("../recommendation/skillRecommend");
const friendRecommend = require("../recommendation/friendRecommend");
const popularSkills = require("../recommendation/popularSkills");

// Cache for recommendations (5 minute TTL)
const recommendationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (userId) => `recommendations_${userId}`;
const isCacheValid = (timestamp) => Date.now() - timestamp < CACHE_TTL;

/**
 * OPTIMIZED: Combined endpoint to fetch all recommendations at once
 * GET /api/recommend/all/:userId
 */
router.get("/all/:userId", async (req, res) => {
  try {
    console.log(`⏱️ [${new Date().toLocaleTimeString()}] Starting recommendation fetch for user ${req.params.userId}`);
    const startTime = Date.now();
    
    const cacheKey = getCacheKey(req.params.userId);
    
    // Check cache
    if (recommendationCache.has(cacheKey)) {
      const cachedData = recommendationCache.get(cacheKey);
      if (isCacheValid(cachedData.timestamp)) {
        console.log(`✅ Serving from cache for user ${req.params.userId}`);
        return res.json({
          success: true,
          cached: true,
          data: cachedData.data,
        });
      }
    }

    // Fetch only needed fields to minimize memory
    const currentUser = await User.findById(req.params.userId)
      .select('skillsOffered skillsLookingFor interests department averageRating reputation _id')
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all users ONCE with only needed fields - lean() for best performance
    const allUsers = await User.find(
      { _id: { $ne: currentUser._id } },
      'name email department averageRating reputation skillsOffered skillsLookingFor interests'
    )
      .lean()
      .exec();

    console.log(`📊 Fetched ${allUsers.length} users for recommendations (${Date.now() - startTime}ms)`);

    // Calculate all recommendations in parallel
    const userSkills = new Set([
      ...(currentUser.skillsOffered || []),
      ...(currentUser.skillsLookingFor || []),
    ]);
    const userInterests = new Set(currentUser.interests || []);
    
    const calcStartTime = Date.now();
    const [matches, skills, friends, similar] = await Promise.all([
      Promise.resolve(matchScore(currentUser, allUsers)),
      Promise.resolve(skillRecommend(currentUser, allUsers)),
      Promise.resolve(friendRecommend(currentUser, allUsers)),
      Promise.resolve(
        allUsers.map(user => {
          const skillOverlap = (user.skillsOffered || []).filter(s => userSkills.has(s)).length +
                              (user.skillsLookingFor || []).filter(s => userSkills.has(s)).length;

          const interestOverlap = (user.interests || []).filter(i => userInterests.has(i)).length;

          const departmentMatch =
            user.department === currentUser.department ? 1 : 0;

          const similarityScore =
            skillOverlap * 2 + interestOverlap * 3 + departmentMatch * 1;

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            averageRating: user.averageRating,
            reputation: user.reputation,
            skillsOffered: user.skillsOffered,
            skillsLookingFor: user.skillsLookingFor,
            interests: user.interests,
            similarityScore: parseFloat(similarityScore.toFixed(2)),
          };
        })
      ),
    ]);
    
    console.log(`⚡ Calculated all recommendations (${Date.now() - calcStartTime}ms)`);

    const popular = await popularSkills();
    console.log(`✨ Got popular skills (${Date.now() - startTime}ms total)`);

    const responseData = {
      matches: matches.slice(0, 10),
      skills: skills.slice(0, 10),
      friends: friends.slice(0, 10),
      similar: similar
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10),
      popular: popular,
    };

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    console.log(`✅ Recommendation complete in ${Date.now() - startTime}ms`);
    res.json({
      success: true,
      cached: false,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching all recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations", error: error.message });
  }
});

/**
 * GET /api/recommend/matches/:userId
 * Get user match recommendations based on skills, interests, and reputation
 */
router.get("/matches/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId).lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUsers = await User.find(
      { _id: { $ne: currentUser._id } },
      "-password"
    )
      .lean()
      .exec();

    const matches = matchScore(currentUser, allUsers);

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Error fetching match recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations", error });
  }
});

/**
 * GET /api/recommend/skills/:userId
 * Get skill recommendations based on similar users and interests
 */
router.get("/skills/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId).lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUsers = await User.find(
      { _id: { $ne: currentUser._id } },
      "-password"
    )
      .lean()
      .exec();

    const recommendations = skillRecommend(currentUser, allUsers);

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching skill recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations", error });
  }
});

/**
 * GET /api/recommend/friends/:userId
 * Get friend recommendations based on profile similarity
 */
router.get("/friends/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId)
      .populate("friends")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUsers = await User.find(
      { _id: { $ne: currentUser._id } },
      "-password"
    )
      .lean()
      .exec();

    const recommendations = friendRecommend(currentUser, allUsers);

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching friend recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations", error });
  }
});

/**
 * GET /api/recommend/popular-skills
 * Get trending and popular skills on the platform
 */
router.get("/popular-skills", async (req, res) => {
  try {
    const popular = await popularSkills();

    res.json({
      success: true,
      data: popular,
    });
  } catch (error) {
    console.error("Error fetching popular skills:", error);
    res.status(500).json({ message: "Error fetching popular skills", error });
  }
});

/**
 * GET /api/recommend/similar-users/:userId
 * Get similar users based on profile (simple similarity - can be enhanced with Python ML)
 */
router.get("/similar-users/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId).lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUsers = await User.find(
      { _id: { $ne: currentUser._id } },
      "-password"
    )
      .lean()
      .exec();

    // Calculate similarity score for each user
    const similarUsers = allUsers
      .map(user => {
        // Skill overlap
        const skillOverlap = [
          ...(user.skillsOffered || []),
          ...(user.skillsLookingFor || []),
        ].filter(s =>
          [
            ...(currentUser.skillsOffered || []),
            ...(currentUser.skillsLookingFor || []),
          ].includes(s)
        ).length;

        // Interest overlap
        const interestOverlap = (user.interests || []).filter(i =>
          (currentUser.interests || []).includes(i)
        ).length;

        // Same department
        const departmentMatch =
          user.department === currentUser.department ? 5 : 0;

        // Rating similarity
        const ratingDiff = Math.abs((user.averageRating || 0) - (currentUser.averageRating || 0));
        const ratingScore = Math.max(0, 5 - ratingDiff);

        const totalSimilarity =
          2 * skillOverlap + 3 * interestOverlap + departmentMatch + ratingScore;

        return {
          user,
          similarityScore: totalSimilarity,
        };
      })
      .filter(u => u.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10)
      .map(item => ({
        ...item.user.toObject(),
        similarityScore: Math.round(item.similarityScore * 100) / 100,
      }));

    res.json({
      success: true,
      count: similarUsers.length,
      data: similarUsers,
    });
  } catch (error) {
    console.error("Error fetching similar users:", error);
    res.status(500).json({ message: "Error fetching similar users", error });
  }
});

/**
 * DELETE /api/recommend/cache/:userId
 * Clear recommendation cache for a specific user
 */
router.delete("/cache/:userId", async (req, res) => {
  try {
    const cacheKey = `recommendations_${req.params.userId}`;
    if (recommendationCache.has(cacheKey)) {
      recommendationCache.delete(cacheKey);
      console.log(`🗑️ Cache cleared for user ${req.params.userId}`);
      return res.json({ success: true, message: "Cache cleared successfully" });
    }
    res.json({ success: true, message: "No cache found for this user" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({ message: "Error clearing cache", error });
  }
});

/**
 * DELETE /api/recommend/cache
 * Clear ALL recommendation caches (admin use only)
 */
router.delete("/cache", async (req, res) => {
  try {
    const count = recommendationCache.size;
    recommendationCache.clear();
    console.log(`🗑️ All recommendation caches cleared (${count} entries)`);
    res.json({ success: true, message: `Cleared ${count} cache entries` });
  } catch (error) {
    console.error("Error clearing all caches:", error);
    res.status(500).json({ message: "Error clearing caches", error });
  }
});

module.exports = router;
