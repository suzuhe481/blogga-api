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

exports.PUT_ONE_USER = asyncHandler(async (req, res, next) => {
  return res.send(`PUT - update a single user - ID: ${req.params.id}`);
});

// // DELETE - delete a single user
exports.DELETE_ONE_USER = asyncHandler(async (req, res, next) => {
  return res.send(`DELETE - delete a single user - ${req.params.id}`);
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
