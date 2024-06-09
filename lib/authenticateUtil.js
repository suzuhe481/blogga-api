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
