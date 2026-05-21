/**
 * Friend Recommendation Engine
 * Recommends potential friends based on profile similarity
 */

module.exports = function friendRecommend(currentUser, users) {
  if (!currentUser || !Array.isArray(users)) {
    return [];
  }

  // Convert to Sets for O(1) lookups
  const userOffers = new Set(currentUser.skillsOffered || []);
  const userLooksFor = new Set(currentUser.skillsLookingFor || []);
  const userInterests = new Set(currentUser.interests || []);
  const friendIds = new Set((currentUser.friends || []).map(f => f.toString()));
  const currentUserId = currentUser._id.toString();

  return users
    .filter(u => u._id.toString() !== currentUserId) // Exclude self
    .filter(u => !friendIds.has(u._id.toString())) // Exclude existing friends
    .map(user => {
      // Count common interests (most important for friendship)
      const commonInterests = (user.interests || []).filter(i => userInterests.has(i)).length;

      // Count similar skills they offer
      const similarSkillsOffered = (user.skillsOffered || []).filter(s => userOffers.has(s)).length;

      // Count similar skills they want
      const similarSkillsWanted = (user.skillsLookingFor || []).filter(s => userLooksFor.has(s)).length;

      // Check same department
      const sameDepartment =
        user.department && currentUser.department && user.department === currentUser.department ? 1 : 0;

      // Check if both are high-rated (trustworthy)
      const bothTrusted = (user.averageRating || 0) >= 3 && (currentUser.averageRating || 0) >= 3 ? 1 : 0;

      // Calculate friend compatibility score
      const score =
        3 * commonInterests + // Most important: common interests
        2 * sameDepartment + // Same department is good for campus connections
        1.5 * similarSkillsOffered + // Similar offered skills
        1.5 * similarSkillsWanted + // Similar wanted skills
        1 * bothTrusted; // Both have good reputation

      return {
        user,
        friendScore: score,
      };
    })
    .filter(u => u.friendScore > 0)
    .sort((a, b) => b.friendScore - a.friendScore)
    .slice(0, 10)
    .map(item => ({
      ...item.user,
      friendScore: Math.round(item.friendScore * 100) / 100,
      reason:
        (item.user.interests || []).length > 0
          ? `${(item.user.interests || [])[0]} in common`
          : "Compatible profile",
    }));
};
