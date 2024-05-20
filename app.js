var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// User Routes
// GET - get all users
app.get("/users", (req, res) => {
  return res.send("GET - get all users");
});

// GET - get a single user
app.get("/users/:userId", (req, res) => {
  return res.send(`GET - get a single user - ${req.params.userId}`);
});

// POST - create a single user
app.post("/users", (req, res) => {
  return res.send("POST - create a single user");
});

// PUT - update a single user
app.put("/users/:userId", (req, res) => {
  return res.send(`PUT - update a single user - ${req.params.userId}`);
});

// DELETE - delete a single user
app.delete("/users/:userId", (req, res) => {
  return res.send(`DELETE - delete a single user - ${req.params.userId}`);
});

// Post Routes
// GET - get all posts
app.get("/posts", (req, res) => {
  return res.send("GET - get all posts");
});

// GET - get a single post
app.get("/posts/:postId", (req, res) => {
  return res.send(`GET - get a single post - ${req.params.postId}`);
});

// POST - create a single post
app.post("/posts", (req, res) => {
  return res.send("POST - create a single post");
});

// PUT - update a single post
app.put("/posts/:postId", (req, res) => {
  return res.send(`PUT - update a single post - ${req.params.postId}`);
});

// DELETE - delete a single post
app.delete("/posts/:postId", (req, res) => {
  return res.send(`DELETE - delete a single post - ${req.params.postId}`);
});

// Comment Routes
// GET - get all comments
app.get("/comments", (req, res) => {
  return res.send("GET - get all comments");
});

// GET - get a single comment
app.get("/comments/:commentId", (req, res) => {
  return res.send(`GET - get a single comment - ${req.params.commentId}`);
});

// POST - create a single comment
app.post("/comments", (req, res) => {
  return res.send("POST - create a single comment");
});

// PUT - update a single comment
app.put("/comments/:commentId", (req, res) => {
  return res.send(`PUT - update a single comment - ${req.params.commentId}`);
});

// DELETE - delete a single comment
app.delete("/comments/:commentId", (req, res) => {
  return res.send(`DELETE - delete a single comment - ${req.params.commentId}`);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
