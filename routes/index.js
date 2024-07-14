var express = require("express");
var router = express.Router();
const passport = require("passport");

const issueJWT = require("../lib/jwtUtil").issueJWT;
const isUser = require("../lib/authenticateUtil").isUser;
const isAdmin = require("../lib/authenticateUtil").isAdmin;
const hasJWT = require("../lib/authenticateUtil").hasJWT;
const { transporter, createEmail } = require("../config/nodemailer");

const User = require("../models/User");

/* GET - home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
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
// Returns a JWT object as a response to valid user.
router.post(
  "/log-in",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  // Below only runs after a successful login.
  function (req, res) {
    // Creates a tokenObject for the logged in user.
    const tokenObject = issueJWT(req.user);

    // Sends token to user in JSON.
    res.status(200).json({
      success: true,
      user: req.user,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
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
      msg: "You can view this protected admin resource",
    });
  }
);

module.exports = router;
