const asyncHandler = require("express-async-handler");

// User Routes
// GET - get all users
exports.GET_ALL_USERS = asyncHandler(async (req, res, next) => {
  return res.send("GET - get all users");
});

// // GET - get a single user
exports.GET_ONE_USER = asyncHandler(async (req, res, next) => {
  console.log(req);
  return res.send(`GET - get a single user - ID: ${req.params.id}`);
});

// // POST - create a single user
exports.POST_ONE_USER = asyncHandler(async (req, res, next) => {
  return res.send(
    `POST - create a single user - First: ${req.body.first_name} Last: ${req.body.last_name}`
  );
});

// // PUT - update a single user
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
