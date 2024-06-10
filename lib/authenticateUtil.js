const passport = require("passport");

// Middleware to check the user is logged in and authenticated.
module.exports.isUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ msg: "You are not allowed. Only logged in users." });
  }
};

// Middleware to check whether the logged in user is an admin.
module.exports.isAdmin = (req, res, next) => {
  if (req.user.status === "Admin") {
    next();
  } else {
    res.status(401).json({ msg: "You are not allowed. Only admins." });
  }
};

// Middleware that checks if user is authenticated with passport jwt.
module.exports.hasJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    // If an exception occurred, "err" will exist.
    // If jwt authentication failed, "user" will be false.
    if (err || !user) {
      return res.status(401).json({ msg: "You are not authorized." });
    } else {
      next();
    }
  })(req, res, next);
};
