const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const { createProxyMiddleware } = require("http-proxy-middleware");

require("dotenv").config();

var app = express();

app.use(cookieParser());

// Setting origin URLS for development testing
var ORIGIN_URLS = [];

// Sets origin urls for dev mode or production.
if (process.env.DEV_MODE === "false") {
  ORIGIN_URLS.push("https://9b1b9415.blogga-frontend.pages.dev");
} else {
  if (process.env.DEV_ORIGIN_URL_1 !== "undefined") {
    ORIGIN_URLS.push(process.env.DEV_ORIGIN_URL_1);
  }

  if (process.env.DEV_ORIGIN_URL_2 !== "undefined") {
    ORIGIN_URLS.push(process.env.DEV_ORIGIN_URL_2);
  }

  if (process.env.DEV_ORIGIN_URL_3 !== "undefined") {
    ORIGIN_URLS.push(process.env.DEV_ORIGIN_URL_3);
  }

  if (process.env.DEV_ORIGIN_URL_4 !== "undefined") {
    ORIGIN_URLS.push(process.env.DEV_ORIGIN_URL_4);
  }
}

// Use DEV_MODE env variable to test locally
// app.use(cors()); // Works
app.use(
  cors({
    origin: "https://9b1b9415.blogga-frontend.pages.dev",
    credentials: true,
  })
);

// if (process.env.DEV_MODE !== "true") {
//   app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header(
//       "Access-Control-Allow-Origin",
//       "https://9b1b9415.blogga-frontend.pages.dev"
//     );
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override, Set-Cookie, Cookie"
//     );
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     next();
//   });
// }

console.log(`CORS ORIGIN_URLS:  ${ORIGIN_URLS}`);

console.log(`DEV MODE: ${process.env.DEV_MODE}`);

if (process.env.DEV_MODE === "true") {
  console.log("dev mode is true as string");
}

if (process.env.DEV_MODE === "false") {
  console.log("dev mode is false as string");
}

// Creates connection to MongoDB
require("./config/database");

// Requiring the passport configuration and passing in the global passport object.
require("./config/passport")(passport);

// Requiring the passport-jwt configuration and passing in the global passport object.
require("./config/passport-jwt")(passport);

// Creates a session using MongoDB database.
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 10, // Minutes
});

// Development session
if (process.env.DEV_MODE === "true") {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      unset: "destroy", // Removes session from database
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
        // maxAge: 1000 * 60 * 60, // 1 hour
        // maxAge: 1000 * 60, // 60 seconds
        // maxAge: 1000 * 30, // 30 seconds
        secure: false,
        sameSite: "lax",
        httpOnly: false,
        path: "/",
      },
    })
  );
}
// Production session
else {
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      unset: "destroy", // Removes session from database
      proxy: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
        // maxAge: 1000 * 60 * 60, // 1 hour
        // maxAge: 1000 * 60, // 60 seconds
        // maxAge: 1000 * 30, // 30 seconds
        secure: true,
        sameSite: "none",
        httpOnly: false,
        path: "/",
      },
    })
  );
}

// Proxy middleware during production
if (process.env.DEV_MODE !== "true") {
  console.log("Proxy is made");

  const proxy = createProxyMiddleware({
    target: "https://9b1b9415.blogga-frontend.pages.dev",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
  });

  app.use("/api", proxy);
}

// Logging the request
app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  console.log("Request Cookies:", req.cookies);
  next();
});

// Debugging
app.use((req, res, next) => {
  console.log("Request Cookies:", req.cookies);
  res.on("finish", () => {
    console.log("Response Headers:", res.getHeaders());
  });
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Initializes the passport object on every request.
app.use(passport.initialize());
app.use(passport.session());

// Getting routes
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const indexRouter = require("./routes/index");

// Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/posts/:postId/comments", commentRouter); // Gets comment resources on a specific post
app.use("/", indexRouter);

// For debugging.
// app.use((req, res, next) => {
// console.log(req.session);
// console.log(req.user);
//   next();
// });

// Allows for the access of variables in all views without needing to manually pass it into every
// controller it's needed.
// req.user - The current user.
// app.use((req, res, next) => {
//   res.locals.currentUser = req.user;
//   next();
// });

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
  res.render("error", { title: "Error Page" });
});

module.exports = app;
