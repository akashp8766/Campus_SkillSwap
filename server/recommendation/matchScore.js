/**
 * Match Score Algorithm for User Recommendations
 * Calculates compatibility score between users based on skills, interests, ratings, and reputation
 */

module.exports = function matchScore(currentUser, users) {
  if (!currentUser || !Array.isArray(users)) {
    return [];
  }

  // Convert arrays to Sets for O(1) lookups instead of O(n)
  const userLooksFor = new Set(currentUser.skillsLookingFor || []);
  const userOffers = new Set(currentUser.skillsOffered || []);
  const userInterests = new Set(currentUser.interests || []);
  const currentUserId = currentUser._id.toString();

  return users
    .filter(u => u._id.toString() !== currentUserId) // Exclude self
    .map(user => {
      // Count matching skills they offer that current user wants (O(1) per item)
      const directMatch = (user.skillsOffered || []).filter(skill => userLooksFor.has(skill)).length;

      // Count matching skills current user offers that they want (O(1) per item)
      const reverseMatch = (user.skillsLookingFor || []).filter(skill => userOffers.has(skill)).length;

      // Count common interests
      const commonInterests = (user.interests || []).filter(interest => userInterests.has(interest)).length;

      // Check if same department
      const sameDepartment =
        user.department && currentUser.department && user.department === currentUser.department ? 1 : 0;

      // Get average rating (0-5)
      const userRating = user.averageRating || 0;

      // Get reputation score
      const userReputation = user.reputation || 0;

      // Calculate final match score with weighted formula
      const score =
        5 * directMatch + // Most important: skills they offer that we want
        3 * reverseMatch + // Skills we offer that they want
        2 * commonInterests + // Common interests
        1 * sameDepartment + // Same department bonus
        1 * userRating + // Average rating
        0.5 * userReputation; // Reputation

      return { user, score };
    })
    .filter(u => u.score > 0) // Only include users with positive score
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 10) // Return top 10 matches
    .map(item => ({
      ...item.user.toObject ? item.user.toObject() : item.user,
      matchScore: Math.round(item.score * 100) / 100, // Round to 2 decimal places
    }));
};
