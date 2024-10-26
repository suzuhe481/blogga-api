const asyncHandler = require("express-async-handler");
const generatePassword = require("../lib/passwordUtil").generatePassword;

const User = require("../models/User");
const Post = require("../models/Post");
const UserPreferences = require("../models/UserPreferences");
const { transporter, mailData } = require("../config/nodemailer");

const isUser = require("../lib/authenticateUtil").isUser;

// User Routes
// GET - get all users.
// Public to all.
exports.GET_ALL_USERS = asyncHandler(async (req, res, next) => {
  return res.send("GET - get all users");
});

// GET - get a single user
// Public to all.
exports.GET_ONE_USER = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();

  // console.log(`User: ${user}`);

  if (!user) {
    return res.status(200).json({
      error: true,
      message: "User does not exist",
    });
  }

  return res.status(200).json({
    success: true,
    user: user,
  });
});

// POST - create a single user.
// Public to all.
exports.POST_ONE_USER = asyncHandler(async (req, res, next) => {
  // Get date at time of creating account.
  const account_created_date = new Date().toISOString();

  // Creating a test user object, with form's given email
  // const user = new User({
  //   first_name: "First",
  //   last_name: "Last",
  //   email: req.body.email,
  //   account_created_date: date,
  //   status: "Member",
  // });

  const userPreferences = new UserPreferences();

  // Creates a user object.
  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    username: req.body.username,
    email: req.body.email,
    account_created_date: account_created_date,
    status: "Member",
    verified: false,
    user_preferences: userPreferences,
  });

  // console.log(`User is: ${user}`);

  const ErrorMessages = [];

  // Checks if email has already been used.
  const emailIsTaken = await User.findOne({ email: req.body.email }).exec();

  const usernameIsTaken = await User.findOne({
    username: req.body.username,
  }).exec();

  if (emailIsTaken) {
    ErrorMessages.push("Email is already in use.");
  }

  if (usernameIsTaken) {
    ErrorMessages.push("Username is already in use.");
  }

  if (ErrorMessages.length > 0) {
    // console.log("errors exist");
    // console.log(ErrorMessages);

    return res.status(401).json({
      error: true,
      message: ErrorMessages,
    });
  } else {
    try {
      // Creates a hashed password
      const hashedPassword = await generatePassword(req.body.password);

      // Assigns hashed password to user object.
      user.password = hashedPassword;

      // Save new user and redirect to home page.
      await user.save();

      // await transporter.sendMail(mailData);
    } catch (err) {
      console.log(err);
    }
  }

  return res.status(200).json({
    success: true,
    user: user,
  });
});

// PUT - update a single user
// Only for own user and admin.
exports.PUT_ONE_USER = asyncHandler(async (req, res, next) => {
  return res.send(`PUT - update a single user - ID: ${req.params.id}`);
});

// GET - Get the currently logged in user's data.
// isUser - Middleware that checks that user is logged in.
exports.GET_SELF_NAME = [
  isUser,
  asyncHandler(async (req, res, next) => {
    return res.status(200).json({
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      verified: req.user.verified,
    });
  }),
];

// GET - Gets the currently logged in user's settings
// isUser - Checks that the user is logged in.
exports.GET_SETTINGS = [
  isUser,
  asyncHandler(async (req, res, next) => {
    // Only returns the setting...
    // display_real_name
    const settings = await UserPreferences.findOne(
      {
        user: req.user._id,
      },
      { display_real_name: 1 }
    ).exec();

    // console.log(req.user._id);

    return res.status(200).json({
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      id: req.user._id,
      settings: settings,
    });
  }),
];

// PUT - Updates the settings for the currently logged in user.
// isUser - Checks that the user is logged in.
exports.PUT_SETTINGS = [
  isUser,
  asyncHandler(async (req, res, next) => {
    const userPreferences = await UserPreferences.findOne(
      {
        user: req.user._id,
      },
      { _id: 1, user: 1, dark_mode: 1 }
    ).exec();

    // console.log(userPreferences);

    const newDisplayNameSetting =
      req.body.display_real_name === "real_name" ? true : false;

    // Updates the "display real name" setting
    userPreferences["display_real_name"] = newDisplayNameSetting;

    // console.log(userPreferences);

    // Updates the UserPreferences model with new settings.
    const UpdatedUserPreferences = await UserPreferences.findByIdAndUpdate(
      userPreferences._id,
      userPreferences,
      {}
    );

    return res.status(200).json({
      success: true,
      UpdatedUserPreferences: UpdatedUserPreferences,
    });
  }),
];

// DELETE - Deletes the profile of currently logged in user and their posts.
// isUser - Checks that the user is logged in.
exports.DELETE_ONE_USER = [
  isUser,
  asyncHandler(async (req, res, next) => {
    // Checks IDs of logged in user and requested user to delete.
    if (req.user._id != req.params.id) {
      return;
    }

    // Delete all user posts and profile.
    await Post.deleteMany({ user: req.params.id }).exec();
    await User.findByIdAndDelete(req.params.id).exec();

    // Removes user session from database.
    await req.session.destroy();

    return res.status(200).json({
      sucess: true,
      message: "Profile deleted.",
    });
  }),
];
