const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    minLength: 1,
  },
  last_name: {
    type: String,
    required: true,
    minLength: 1,
  },
  username: {
    type: String,
    required: true,
    minLength: 1,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minLength: 1,
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
  },
  account_created_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Member", "Admin"],
    default: "Member",
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  user_preferences: [
    {
      type: Schema.Types.ObjectId,
      ref: "UserPreferences",
    },
  ],
});

// Export module
module.exports = mongoose.model("User", UserSchema);
