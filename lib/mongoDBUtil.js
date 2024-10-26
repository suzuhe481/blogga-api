const User = require("../models/User");
const UserPreferences = require("../models/UserPreferences");

// NOT USING ANYMORE
// node -p "require('./scripts/mongoDB.js').updateAllUsers()"
module.exports.updateUser = async function (user) {
  console.log("updating user model with current model");

  // console.log("user");
  // console.log(user);

  const mongoUser = await User.findById(user.id).exec();
  console.log(mongoUser);

  // console.log(`user preferences: ${mongoUser.hasOwnProperty("verified")}`);
  // console.log(`user preferences: ${"user_preferences" in mongoUser}`);
  // console.log(`verified: ${mongoUser.verified}`);
  // console.log(`verified: ${"verified" in mongoUser}`);

  /* 
  Property: verified
  Default value: false
  */
  // if (!mongoUser.hasOwnProperty("verified")) {
  if (!"verified" in mongoUser) {
    console.log("user does not have a verified");

    const verifyUpdate = { verified: false };
    const options = {};

    // Add the verify property with default value.
    await User.findByIdAndUpdate(mongoUser.id, verifyUpdate, options).exec();
    await console.log("after");
  }

  // console.log("user_preferences" in mongoUser);
  console.log(mongoUser.user_preferences);

  /* 
  Property: user_preferences
  Default value: user_preferences object
  */
  // if (!"user_preferences" in mongoUser) {
  if (mongoUser.user_preferences === undefined) {
    console.log("user preferences does not exist");
    const defaultPreferences = new UserPreferences();
    defaultPreferences.user = mongoUser._id;

    const userPreferencesUpdate = { user_preferences: defaultPreferences };
    const options = {};

    // Add the verify property with default value.
    await User.findByIdAndUpdate(mongoUser.id, userPreferencesUpdate, options);
    await defaultPreferences.save();
  }

  // const mongoUserPreferences = await UserPreferences.findById(
  //   mongoUser.user_preferences._id
  // ).exec();

  // console.log(mongoUserPreferences);
  // console.log(mongoUser.user_preferences);

  // if (!"dark_mode" in mongoUser.user_preferences) {
  //   console.log("user preferences does not have a dark mode setting");
  // }

  // console.log(mongoUser.hasOwnProperty("verified"));
  // console.log(typeof mongoUser.verified);
  // console.log("verified" in mongoUser);
  // if (!mongoUser.hasOwnProperty("verified")) {
  //   console.log("user does not have a verified");

  //   const verifyUpdate = { verified: false };
  //   const options = {};

  //   // Add the verify property with default value.
  //   // await User.findByIdAndUpdate(mongoUser.id, verifyUpdate, options).exec();
  // } else {
  //   console.log("verified exists");
  // }

  /* 
  Property: user_preferences
  Default value: user_preferences object
  */
  // if (!mongoUser.hasOwnProperty("user_preferences")) {
  //   console.log("user preferences does not exist");
  //   const defaultPreferences = new UserPreferences();

  //   const userPreferencesUpdate = { user_preferences: defaultPreferences };
  //   const options = {};

  //   // Add the verify property with default value.
  //   await User.findByIdAndUpdate(mongoUser.id, userPreferencesUpdate, options);
  // } else {
  //   console.log("preferences exists");
  // }

  // if (mongoUser.hasOwnProperty("verified")) {
  //   console.log(`verified property exists and is: ${mongoUser.verified}`);
  // } else {
  //   console.log("user does not have a verified");

  //   const verifyUpdate = { verified: false };
  //   const options = {};

  //   // Add the verify property with default value.
  //   await User.findByIdAndUpdate(mongoUser.id, verifyUpdate, options);
  // }

  // if ("email" in mongoUser) {
  //   console.log(`email property exists and is: ${mongoUser.email}`);
  // } else {
  //   console.log("user does not have a email");
  // }

  // if (mongoUser.hasOwnProperty("username")) {
  //   // if ("username" in mongoUser) {
  //   console.log(`username property exists and is: ${mongoUser.username}`);
  // } else {
  //   console.log("user does not have a username");
  // }

  // if ("random" in mongoUser) {
  //   console.log(`random property exists and is: ${mongoUser.random}`);
  // } else {
  //   console.log("user does not have a random");
  // }

  // console.log(user);

  // const defaultPreferences = new UserPreferences();
  // const defaultUser = new User({
  //   _id: req.user.id,
  //   user_preferences: defaultPreferences,
  // });

  // console.log(defaultUser);

  // const options = { strict: false };
  // Updates user model
  // await User.findByIdAndUpdate(req.user.id, defaultUser, options);
};
