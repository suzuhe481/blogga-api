var express = require("express");
var router = express.Router();
const passport = require("passport");

const isUser = require("../lib/authenticateUtil").isUser;
const isAdmin = require("../lib/authenticateUtil").isAdmin;
const hasJWT = require("../lib/authenticateUtil").hasJWT;

const sendVerificationEmail =
  require("../lib/sendVerificationEmailUtil").sendVerificationEmail;

const User = require("../models/User");

/* GET - home page. */
router.get("/", isUser, function (req, res, next) {
  return res.status(200).json({
    message: "Home page",
  });
});

/* GET - Login page */
router.get("/login", function (req, res, next) {
  res.render("login", { title: "Login" });
});

/* GET - Register page */
router.get("/register", function (req, res, next) {
  res.render("register", { title: "Register" });
});

/* POST - Login the user */
// Uses passport to login and authenticate the user.
router.post(
  "/log-in",
  passport.authenticate("local", { failWithError: true }),
  // Below only runs after a successful login.
  async function (req, res) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  },
  // Below runs if there was an error logging in.
  function (err, req, res, next) {
    return res.status(401).json({
      error: true,
      message: ["Invalid email or password."],
    });
  }
);

/* GET - Logout the user */
// Uses passport to logout the user.
// Calls logout() on req.
router.post("/log-out", (req, res, next) => {
  console.log("Start");

  req.logout();
  req.session.destroy();

  return res.status(200).json({
    message: "Logout success",
  });
});

/* GET - Login success */
router.get("/login-success", isUser, function (req, res, next) {
  res.render("login-success", { title: "Successful log in" });
});

/* GET */
// Only for logged in users.
router.get("/protected", isUser, function (req, res, next) {
  res.render("protected", { title: "Protected" });
});

// NOT USED ANYMORE
/* GET */
// Only for admins. Verified with jwt and isAdmin middleware.
// Admin Resource - Requires JWT authorization to access.
router.get(
  "/admin-resource",
  isUser,
  isAdmin,
  hasJWT,
  function (req, res, next) {
    return res.status(200).json({
      message: "You can view this protected admin resource",
    });
  }
);

// Sends verification email to the logged in user's email address.
router.get("/send-verification", isUser, async function (req, res, next) {
  const result = await sendVerificationEmail(req.user);

  if (result.error) {
    return res.status(500).json({
      error: true,
      message: "Verification email could not be sent. Try again later.",
    });
  }

  return res.status(200).json({
    message: "Verification email has been sent.",
  });
});

// Verifies a logged in user's email verification link.
// Link contains JWT which is verified by the hasJWT middleware.
// If JWT is valid, sets the user's verified status to true.
router.get("/verify", isUser, hasJWT, async function (req, res, next) {
  const verifyUpdate = { verified: true };

  // Set user verified to true and update user
  await User.findByIdAndUpdate(req.user.id, verifyUpdate, {});

  return res.status(200).json({
    message: "User is verified",
  });
});

// Route that checks if a given email is already taken by another user.
router.get("/check-email/:email", async function (req, res, next) {
  // RegExp to search case insensitive
  const emailRegex = new RegExp(`^${req.params.email}$`, "i");

  // Checks if email has already been used.
  const user = await User.findOne({ email: { $regex: emailRegex } }).exec();

  const emailAvailable = user ? false : true;

  return res.status(200).json({
    emailAvailable: emailAvailable,
  });
});

module.exports = router;
