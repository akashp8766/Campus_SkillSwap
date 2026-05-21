const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    skillsOffered: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsLookingFor: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    reputation: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    sessionsCompleted: {
      type: Number,
      default: 0,
    },
    matchesCompleted: {
      type: Number,
      default: 0,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    searchHistory: [
      {
        type: String,
        trim: true,
      },
    ],
    profileViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
userSchema.index({ skillsOffered: 1 });
userSchema.index({ skillsLookingFor: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ department: 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ reputation: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate reputation based on feedback
userSchema.methods.updateReputation = function () {
  // This will be called when feedback is submitted
  // Implementation will be in the feedback controller
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
