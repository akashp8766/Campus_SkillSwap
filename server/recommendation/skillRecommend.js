/**
 * Skill Recommendation Engine
 * Recommends skills based on what similar users are learning
 */

module.exports = function skillRecommend(currentUser, users) {
  if (!currentUser || !Array.isArray(users)) {
    return [];
  }

  const skillCount = {};
  
  // Convert to Sets for O(1) lookups
  const userOffers = new Set(currentUser.skillsOffered || []);
  const userLooksFor = new Set(currentUser.skillsLookingFor || []);
  const userInterests = new Set(currentUser.interests || []);
  const currentUserId = currentUser._id.toString();

  // Find users with common skills or interests
  users.forEach(user => {
    if (user._id.toString() === currentUserId) return; // Skip self

    // Check if they have common offered skills or interests
    const commonOfferedSkills = (user.skillsOffered || []).filter(s => userOffers.has(s)).length;
    const commonInterests = (user.interests || []).filter(i => userInterests.has(i)).length;

    // If there's any commonality, count their learning skills
    if (commonOfferedSkills > 0 || commonInterests > 0) {
      (user.skillsLookingFor || []).forEach(skill => {
        // Only recommend skills user doesn't already offer or look for
        if (!userOffers.has(skill) && !userLooksFor.has(skill)) {
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        }
      });
    }
  });

  // Also consider popular skills from highly rated users
  users.forEach(user => {
    if ((user.averageRating || 0) >= 4 && (user.skillsOffered || []).length > 0) {
      (user.skillsOffered || []).forEach(skill => {
        if (!userOffers.has(skill) && !userLooksFor.has(skill)) {
          // Add weighted boost for high-rated users
          skillCount[skill] = (skillCount[skill] || 0) + 2;
        }
      });
    }
  });

  // Sort by frequency and return top 10 skills
  return Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, frequency]) => ({
      skill,
      recommendationScore: frequency,
      reason: frequency >= 5 ? "Trending in your interest group" : "Popular skill",
    }));
};
