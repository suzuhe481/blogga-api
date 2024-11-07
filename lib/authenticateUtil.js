const passport = require("passport");

// Middleware to check the user is logged in and authenticated.
module.exports.isUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.json({
      error: true,
      message: "You are not logged in.",
    });
  }
};

// Middleware to check whether the logged in user is an admin.
module.exports.isAdmin = (req, res, next) => {
  if (req.user.status === "Admin") {
    next();
  } else {
    res.status(401).json({ message: "You are not allowed. Only admins." });
  }
};

// Middleware that checks if user is authenticated with passport jwt.
module.exports.hasJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    // If an exception occurred, "err" will exist.
    // If jwt authentication failed, "user" will be false.
    // If user id from the request(logged in user) does not match user id from the jwt, error.
    if (err || !user || req.user.id !== user.id) {
      return res
        .status(401)
        .json({ error: true, message: "You are not authorized." });
    } else {
      next();
    }
  })(req, res, next);
};

// Middleware that checks if a logged in user has verified their account.
module.exports.isVerified = (req, res, next) => {
  if (req.isAuthenticated() && req.user.verified) {
    next();
  } else {
    return res.json({
      error: true,
      message: "You are not verified.",
      userLoggedIn: true,
      userVerified: false,
    });
  }
};
