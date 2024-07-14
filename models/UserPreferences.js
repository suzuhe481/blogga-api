const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserPreferences = new Schema({
  dark_mode: {
    type: Boolean,
    required: true,
    default: false,
  },
  display_real_name: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Export module
module.exports = mongoose.model("UserPreferences", UserPreferences);
