const LocalStrategy = require("passport-local").Strategy;
const validatePassword = require("../lib/passwordUtil").validatePassword;
const User = require("../models/User");

// Custom field for LocalStrategy.
// To allows user to sign in with email instead of username.
const customFields = {
  usernameField: "email",
};

// Verify the user.
const verifyUser = async (email, password, done) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  // User with that email does not exist.
  if (!user) {
    return done(null, false, { message: "Incorrect email" });
  }

  const validUser = await validatePassword(password, user.password);

  if (validUser) {
    return done(null, user);
  } else {
    return done(null, false, { message: "Incorrect password" });
  }
};

// Setting up the LocalStrategy to authenticate users on logging in.
const strategy = new LocalStrategy(customFields, verifyUser);

module.exports = (passport) => {
  passport.use(strategy);

  // Following 2 functions are used in the background.
  // Allows users to stay logged in by creating a cookie.
  // Defines the information that passport is looking for when it creates and decodes the cookies.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
