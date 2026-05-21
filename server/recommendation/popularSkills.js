/**
 * Popular Skills Recommendation
 * Recommends trending and popular skills on the platform
 * Uses MongoDB aggregation
 */

const User = require("../models/User");

module.exports = async function popularSkills() {
  try {
    // Aggregate popular skills from skillsOffered
    const offeredSkills = await User.aggregate([
      {
        $unwind: "$skillsOffered",
      },
      {
        $group: {
          _id: "$skillsOffered",
          count: { $sum: 1 },
          avgRating: { $avg: "$averageRating" },
        },
      },
      {
        $match: { _id: { $ne: "", $ne: null } }, // Filter empty strings
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 15,
      },
      {
        $project: {
          skill: "$_id",
          offered: "$count",
          avgMentorRating: { $round: ["$avgRating", 2] },
          _id: 0,
        },
      },
    ]);

    // Aggregate popular skills from skillsLookingFor
    const wantedSkills = await User.aggregate([
      {
        $unwind: "$skillsLookingFor",
      },
      {
        $group: {
          _id: "$skillsLookingFor",
          count: { $sum: 1 },
        },
      },
      {
        $match: { _id: { $ne: "", $ne: null } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 15,
      },
      {
        $project: {
          skill: "$_id",
          wanted: "$count",
          _id: 0,
        },
      },
    ]);

    // Merge and combine for trending skills
    const skillMap = {};

    offeredSkills.forEach(s => {
      if (s.skill) {
        skillMap[s.skill] = {
          skill: s.skill,
          taught: s.offered,
          avgMentorRating: s.avgMentorRating,
          wanted: 0,
          trending: 0,
        };
      }
    });

    wantedSkills.forEach(s => {
      if (s.skill) {
        if (!skillMap[s.skill]) {
          skillMap[s.skill] = {
            skill: s.skill,
            taught: 0,
            wanted: s.wanted,
            avgMentorRating: 0,
            trending: 0,
          };
        } else {
          skillMap[s.skill].wanted = s.wanted;
        }
      }
    });

    // Calculate trending score (combination of taught + wanted)
    Object.values(skillMap).forEach(s => {
      s.trending = s.taught + s.wanted;
    });

    // Sort and return top skills with different categories
    const allSkills = Object.values(skillMap);

    return {
      mostTaught: allSkills
        .sort((a, b) => b.taught - a.taught)
        .slice(0, 8)
        .map(s => ({
          skill: s.skill,
          count: s.taught,
          avgMentorRating: s.avgMentorRating,
          category: "Most Taught",
        })),

      mostWanted: allSkills
        .sort((a, b) => b.wanted - a.wanted)
        .slice(0, 8)
        .map(s => ({
          skill: s.skill,
          count: s.wanted,
          category: "Most Wanted",
        })),

      trending: allSkills
        .sort((a, b) => b.trending - a.trending)
        .slice(0, 10)
        .map(s => ({
          skill: s.skill,
          totalActivity: s.trending,
          taught: s.taught,
          wanted: s.wanted,
          category: "Trending",
        })),
    };
  } catch (error) {
    console.error("Error fetching popular skills:", error);
    return {
      mostTaught: [],
      mostWanted: [],
      trending: [],
    };
  }
};
