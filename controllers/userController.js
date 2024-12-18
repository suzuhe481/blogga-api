const mongoose = require("mongoose");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const generatePassword = require("../lib/passwordUtil").generatePassword;

const User = require("../models/User");
const Blog = require("../models/Blog");
const UserPreferences = require("../models/UserPreferences");
const { validatePassword } = require("../lib/passwordUtil");

const sendVerificationEmail =
  require("../lib/sendVerificationEmailUtil").sendVerificationEmail;

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

  if (!user) {
    return res.status(200).json({
      error: true,
      message: "User does not exist",
    });
  }

  // Getting user preferences object/
  const userPreferences = await UserPreferences.findById(
    user.user_preferences
  ).exec();

  // Gets the user's preferred display name/
  const displayName = userPreferences.display_real_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  // Converting user to object to remove MongoDB properties.
  const userObj = user.toObject();

  // Sanitizing user to remove sensitive information
  const {
    first_name,
    last_name,
    username,
    email,
    status,
    comments,
    verified,
    user_preferences,
    blogs,
    password,
    ...sanitizedUser
  } = userObj;

  // Adding prefference display name as "author" to user
  sanitizedUser["author"] = displayName;

  return res.status(200).json({
    success: true,
    user: sanitizedUser,
  });
});

// POST - create a single user.
// Public to all.
exports.POST_ONE_USER = [
  // Validate form data.
  body("first_name", "First name cannot be empty.")
    .trim()
    .escape()
    .isLength({ min: 1 }),
  body("last_name", "Last name cannot be empty.")
    .trim()
    .escape()
    .isLength({ min: 1 }),
  body("username")
    .trim()
    .escape()
    .isLength({ min: 4 })
    .custom((value) => !/\s/.test(value))
    .withMessage("Username cannot have spaces.")
    .isAlphanumeric()
    .withMessage("Username can only contain letters or numbers.")
    // Checks is a username is taken.
    .custom(async (username) => {
      const usernameIsTaken = await User.findOne({
        username: username,
      }).exec();

      if (usernameIsTaken) {
        throw new Error("Validator: Username is already in use.");
      }
    }),
  // Checks if an email address is taken.
  body("email", "Email is not valid.")
    .trim()
    .escape()
    .isEmail()
    .custom(async (email) => {
      const emailIsTaken = await User.findOne({ email: email }).exec();

      if (emailIsTaken) {
        throw new Error("Validator: Email is already in use.");
      }
    }),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors.
    const errors = validationResult(req);

    // Get date at time of creating account.
    const account_created_date = new Date().toISOString();

    // Creates a user object.
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      account_created_date: account_created_date,
      status: "Member",
      verified: false,
    });

    // Sending errors ia validation failed.
    if (!errors.isEmpty()) {
      // Renames the "msg" key to "message", since the frontend uses message as the key.
      errors.errors.map((value) => {
        value.message = value.msg;
        delete value.msg;
        return value;
      });

      return res.status(401).json({
        error: true,
        message: errors.array(),
      });
    } else {
      try {
        // Creates a hashed password
        const hashedPassword = await generatePassword(req.body.password);

        // Assigns hashed password to user object.
        user.password = hashedPassword;

        // Create the user preferences
        const userPreferences = new UserPreferences();

        // Save user's id to userPreferences
        userPreferences.user = user._id;

        // Save the userPreferences
        await userPreferences.save();

        // Update user with user_preferences id
        user.user_preferences = userPreferences._id;

        // Save new user and redirect to home page.
        await user.save();

        const result = await sendVerificationEmail(user);
      } catch (err) {
        console.log(err);

        // Deletes userPreferences after it was created
        if (userPreferences && userPreferences._id) {
          await UserPreferences.deleteOne({ _id: userPreferences._id });
        }
      }
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  }),
];

// PUT - update a single user
// Only for own user and admin.
// exports.PUT_ONE_USER = asyncHandler(async (req, res, next) => {
//   return res.send(`PUT - update a single user - ID: ${req.params.id}`);
// });

// GET - Get the currently logged in user's data.
// isUser - Middleware that checks that user is logged in.
exports.GET_SELF_NAME = [
  isUser,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("user_preferences");

    // Stores the appropriate author name using the user_preferences.
    const author = user.user_preferences.display_real_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

    return res.status(200).json({
      verified: req.user.verified,
      id: req.user._id,
      author,
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
    const preferences = await UserPreferences.findOne(
      {
        user: req.user._id,
      },
      { display_real_name: 1 }
    ).exec();

    return res.status(200).json({
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      username: req.user.username,
      id: req.user._id,
      preferences: preferences,
    });
  }),
];

// PUT - Updates the settings for the currently logged in user.
// isUser - Checks that the user is logged in.
exports.PUT_SETTINGS = [
  isUser,
  asyncHandler(async (req, res, next) => {
    try {
      // const user = await User.findById(req.user._id).exec();
      const userPreferences = await UserPreferences.findOne(
        {
          user: req.user._id,
        },
        { _id: 1, user: 1, dark_mode: 1 }
      ).exec();

      // Makes sure that only the allowed fields are included in the updatePreferencesData object.
      // This prevents users from adding their own fields.
      const newPreferences = req.body.newPreferences;
      newPreferences["display_real_name"] =
        newPreferences["display_real_name"] === "real_name" ? true : false; // Turns the display_real_name field into a boolean.
      const updatePreferencesData = {};
      const allowedPreferencesFields = ["display_real_name"];
      for (const field of allowedPreferencesFields) {
        if (newPreferences[field] !== undefined) {
          updatePreferencesData[field] = newPreferences[field];
        }
      }

      // Makes sure that only the allowed fields are included in the updateSettingsData object.
      // This prevents users from adding their own fields.
      const newSettings = req.body.newSettings;
      const updateSettingsData = {};
      const allowedSettingsFields = ["first_name", "last_name", "username"];
      for (const field of allowedSettingsFields) {
        if (newSettings[field] !== undefined) {
          updateSettingsData[field] = newSettings[field];
        }
      }

      const usernameIsTaken = await User.findOne({
        username: updateSettingsData["username"],
      }).exec();

      // Username belongs to different user.
      // This also allows settings to be saved if the user is saving with the same username.
      if (!usernameIsTaken.equals(req.user)) {
        return res.status(401).json({
          error: true,
          message: "Couldn't change username: Username is taken.",
        });
      }

      // Updates the UserPreferences model with new preferences.
      await UserPreferences.findByIdAndUpdate(
        userPreferences._id,
        { $set: updatePreferencesData },
        { new: true, runValidators: true }
      );

      // Updates the User with new settings.
      // new: true => option to return the updated document.
      // runValidators: true => Ensures that validation rules on model are enforces
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateSettingsData },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.log(error);
    }
  }),
];

// PUT - Updates the logged in user's email.
exports.PUT_EMAIL = [
  isUser,
  asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).exec();

      const newEmail = req.body.email;
      const confirmPassword = req.body.emailPassword;

      const validPassword = await validatePassword(
        confirmPassword,
        req.user.password
      );

      if (!validPassword) {
        return res.status(401).json({
          error: true,
          message: "Couldn't change email: Invalid password.",
        });
      } else {
        const updateEmail = { $set: { email: newEmail } };

        const result = await User.findByIdAndUpdate(req.user._id, updateEmail, {
          new: true,
          runValidators: true,
        });

        return res.status(200).json({
          success: true,
          message: "Email successfully changed.",
        });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        error: true,
        message: "Something went wrong while updating the email.",
      });
    }
  }),
];

// PUT - Updates the logged in user's password.
exports.PUT_PASSWORD = [
  isUser,
  asyncHandler(async (req, res, next) => {
    // const user = await User.findById(req.params.id).exec();

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    // Given new password is too short.
    if (newPassword.length < 8) {
      return res.status(401).json({
        error: true,
        message: "Couldn't change password: New password is too short.",
      });
    }

    // Check if old password confirmation matches.
    const validPassword = await validatePassword(
      oldPassword,
      req.user.password
    );

    // New password and password confirm do not match.
    if (!validPassword) {
      return res.status(401).json({
        error: true,
        message: "Couldn't change password: Invalid password.",
      });
    } else {
      // Changing password

      // Creates a hashed password
      const hashedPassword = await generatePassword(newPassword);

      const updatePassword = { $set: { password: hashedPassword } };

      await User.findByIdAndUpdate(req.user._id, updatePassword, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        success: true,
        message: "Password successfully changed.",
      });
    }
  }),
];

// DELETE - Deletes the profile of currently logged in user and their blogs.
// The logged in user is identified by the current user session based on req.user.
// isUser - Checks that the user is logged in.
exports.DELETE_ONE_USER = [
  isUser,
  asyncHandler(async (req, res, next) => {
    // Checks if user in session is the same as the user being requested
    if (req.user._id.toString() !== req.params.id) {
      // Return a not authorized error
      return res.status(401).json({
        error: true,
        message: "You are not authorized.",
      });
    }

    // Get the user ID from the user session.
    const userID = req.user._id;

    // Delete order - Blogs, Preferences, User.
    await Blog.deleteMany({ user: userID }).exec();
    await UserPreferences.deleteOne({ user: userID }).exec();
    await User.findByIdAndDelete(userID).exec();

    // Removes user session from database.
    await req.session.destroy();

    return res.status(200).json({
      success: true,
      message: "Profile deleted.",
    });
  }),
];

// GET - Gets all of the blogs from the given user.
// Uses pagination
exports.GET_USER_BLOGS = asyncHandler(async (req, res, next) => {
  const userID = req.params.id;

  // ID is not given or is not valid.
  if (!userID || !mongoose.isValidObjectId(userID)) {
    return res.status(400).json({
      error: true,
      message: "ID is invalid.",
    });
  }

  try {
    // Getting the user
    const user = await User.findById(userID).exec();

    // User does not exist
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User does not exist",
      });
    }

    // Checks if the logged in user is the same user of the data being requested.
    // MongoDB ObjectId needs to be converted to string.
    const isLoggedInUser = !req.user
      ? false
      : req.user._id.toString() !== req.params.id
      ? false
      : true;

    // Getting user preferences object
    const userPreferences = await UserPreferences.findById(
      user.user_preferences
    ).exec();

    // Count of published blogs.
    const blogsPublished = await Blog.countDocuments({
      _id: { $in: user.blogs },
      published: true,
    });

    // Pagination variables
    const currentPage = parseInt(req.query.currentPage) || 1; // Default 1
    const blogsPerPage = parseInt(req.query.blogsPerPage) || 5; // Default 5
    const blogsSkipped = (currentPage - 1) * blogsPerPage;

    // const totalBlogCount = user.blogs.length;
    // const blogsPublished = userBlogs.length;

    const totalPages = Math.ceil(blogsPublished / blogsPerPage);

    // If user is currently on a higher page number than what is currently available,
    // changes the currentPage to the last page.
    // If the page becomes less than 1, sets to 1.
    // Otherwise, gets set to the currentPage.
    const newCurrentPage =
      currentPage <= 1
        ? 1
        : currentPage > totalPages
        ? totalPages
        : currentPage;

    // Note: _id: 1 is added to sort because MongoDB will sometimes need
    // a field with a unique value if documents are the same.
    // It would be possible for dates to be equal.
    // The additional _id field helps to sort properly.
    // Query: This query gets a collection of blogs from a SPECIFIC author, as well as the
    // blog author's display_real_name setting.
    const userBlogs = await Blog.find({
      _id: { $in: user.blogs },
      published: true,
    })
      .populate({
        path: "author",
        populate: {
          path: "user_preferences",
          select: "display_real_name",
        },
      })
      .sort({ date: -1, _id: 1 })
      .skip(blogsSkipped)
      .limit(blogsPerPage)
      .exec();

    // Edits the author field to display the real name or last name depending on preferences.
    const userBlogsWithAuthorName = userBlogs.map((blog) => {
      const displayName = userPreferences.display_real_name
        ? `${user.first_name} ${user.last_name}`
        : user.username;

      // toObject() converts blog into a plain-old javascript object.
      return {
        ...blog.toObject(),
        author: displayName,
        authorID: blog.author._id,
      };
    });

    // Separate displayName variable to send in response.
    const displayName = userPreferences.display_real_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;
    console.log("after");

    const authorData = {
      name: displayName,
      memberSince: user.account_created_date,
      isLoggedInUser: isLoggedInUser,
      blogsPublished,
    };

    return res.status(200).json({
      userBlogs: userBlogsWithAuthorName,
      newCurrentPage,
      authorData,
    });
  } catch (error) {
    console.log(error);
  }
});

exports.GET_USER_DRAFTS = [
  isUser,
  asyncHandler(async (req, res, next) => {
    try {
      // Checks if user in session is the same as the user being requested
      if (req.user._id.toString() !== req.params.id) {
        // Return a not authorized error
        return res.status(401).json({
          error: true,
          message: "You are not authorized.",
        });
      }

      const userID = req.params.id;

      // ID is not given or is not valid.
      if (!userID || !mongoose.isValidObjectId(userID)) {
        return res.status(400).json({
          error: true,
          message: "ID is invalid.",
        });
      }

      // Getting the user
      const user = await User.findById(userID).exec();

      // User does not exist
      if (!user) {
        return res.status(404).json({
          error: true,
          message: "User does not exist",
        });
      }

      // Checks if the logged in user is the same user of the data being requested.
      // MongoDB ObjectId needs to be converted to string.
      const isLoggedInUser =
        req.user._id.toString() !== req.params.id ? false : true;

      // Getting user preferences object
      const userPreferences = await UserPreferences.findById(
        user.user_preferences
      ).exec();

      // Count of published blogs.
      const blogsPublished = await Blog.countDocuments({
        _id: { $in: user.blogs },
        published: true,
      });

      // Count of drafts.
      const blogDrafts = await Blog.countDocuments({
        _id: { $in: user.blogs },
        published: false,
      });

      // Pagination variables
      const currentPage = parseInt(req.query.currentPage) || 1; // Default 1
      const blogsPerPage = parseInt(req.query.blogsPerPage) || 5; // Default 5
      const blogsSkipped = (currentPage - 1) * blogsPerPage;

      // const totalBlogCount = user.blogs.length;

      const totalPages = Math.ceil(blogDrafts / blogsPerPage);

      // If user is currently on a higher page number than what is currently available,
      // changes the currentPage to the last page.
      // If the page becomes less than 1, sets to 1.
      // Otherwise, gets set to the currentPage.
      const newCurrentPage =
        currentPage <= 1
          ? 1
          : currentPage > totalPages
          ? totalPages
          : currentPage;

      // Note: _id: 1 is added to sort because MongoDB will sometimes need
      // a field with a unique value if documents are the same.
      // It would be possible for dates to be equal.
      // The additional _id field helps to sort properly.
      // Query: This query gets a collection of blogs from a SPECIFIC author, as well as the
      // blog author's display_real_name setting.
      const userBlogs = await Blog.find({
        _id: { $in: user.blogs },
        published: false,
      })
        .populate({
          path: "author",
          populate: {
            path: "user_preferences",
            select: "display_real_name",
          },
        })
        .sort({ date: -1, _id: 1 })
        .skip(blogsSkipped)
        .limit(blogsPerPage)
        .exec();

      // Edits the author field to display the real name or last name depending on preferences.
      const userBlogsWithAuthorName = userBlogs.map((blog) => {
        const displayName = userPreferences.display_real_name
          ? `${user.first_name} ${user.last_name}`
          : user.username;

        // toObject() converts blog into a plain-old javascript object.
        return {
          ...blog.toObject(),
          author: displayName,
        };
      });

      // Separate displayName variable to send in response.
      const displayName = userPreferences.display_real_name
        ? `${user.first_name} ${user.last_name}`
        : user.username;

      const authorData = {
        name: displayName,
        memberSince: user.account_created_date,
        isLoggedInUser: isLoggedInUser,
        blogsPublished: blogsPublished,
        blogDrafts: blogDrafts,
      };

      return res.status(200).json({
        userBlogs: userBlogsWithAuthorName,
        newCurrentPage,
        authorData: authorData,
      });
    } catch (error) {
      console.log(error);
    }
  }),
];
