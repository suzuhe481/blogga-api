var express = require("express");
var router = express.Router();
const passport = require("passport");

const issueJWT = require("../lib/jwtUtil").issueJWT;
const isUser = require("../lib/authenticateUtil").isUser;
const isAdmin = require("../lib/authenticateUtil").isAdmin;

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
router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
