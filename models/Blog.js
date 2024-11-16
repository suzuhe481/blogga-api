const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: 1,
  },
  blog: {
    type: String,
    required: true,
    minLength: 1,
  },
  date: {
    type: Date,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  published: {
    type: Boolean,
    required: true,
    default: false,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
});

// Export module
module.exports = mongoose.model("Blog", BlogSchema);
