const FriendRequest = require('../models/FriendRequest');

/**
 * Returns the accepted friendship record between two users if it exists.
 */
const verifyFriendship = async (userAId, userBId) => {
  return FriendRequest.findOne({
    status: 'accepted',
    $or: [
      { sender: userAId, receiver: userBId },
      { sender: userBId, receiver: userAId }
    ]
  });
};

module.exports = {
  verifyFriendship
};
