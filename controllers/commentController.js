const asyncHandler = require("express-async-handler");

// Comment Routes
// GET - get all comments
exports.GET_ALL_COMMENTS = asyncHandler(async (req, res, next) => {
  return res.send("GET - get all comments");
});

// // GET - get a single comment
exports.GET_ONE_COMMENT = asyncHandler(async (req, res, next) => {
  console.log(req);
  return res.send(`GET - get a single comment - ID: ${req.params.commentId}`);
});

// // POST - create a single comment
exports.POST_ONE_COMMENT = asyncHandler(async (req, res, next) => {
  return res.send(
    `POST - create a single comment - Comment: ${req.body.comment}`
  );
});

// // PUT - update a single comment
exports.PUT_ONE_COMMENT = asyncHandler(async (req, res, next) => {
  return res.send(
    `PUT - update a single comment - ID: ${req.params.commentId}`
  );
});

// // DELETE - delete a single comment
exports.DELETE_ONE_COMMENT = asyncHandler(async (req, res, next) => {
  return res.send(`DELETE - delete a single comment - ${req.params.commentId}`);
});
