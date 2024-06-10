var express = require("express");
var router = express.Router();
const passport = require("passport");

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

module.exports = router;
