const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");

require("dotenv").config();

// Routes
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const indexRouter = require("./routes/index");

var app = express();

// Creates connection to MongoDB
require("./config/database");

// Requiring the passport configuration and passing in the global passport object.
require("./config/passport")(passport);

// Requiring the passport-jwt configuration and passing in the global passport object.
require("./config/passport-jwt")(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/posts/:postId/comments", commentRouter); // Gets comment resources on a specific post

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
