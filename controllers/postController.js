const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const Post = require("../models/Post");

const isUser = require("../lib/authenticateUtil").isUser;

const { nanoid } = require("nanoid");

// Post Routes
// GET - get all posts
exports.GET_ALL_POSTS = asyncHandler(async (req, res, next) => {
  return res.send("GET - get all posts");
});

// // GET - get a single post
exports.GET_ONE_POST = asyncHandler(async (req, res, next) => {
  console.log(req);
  return res.send(`GET - get a single post - ID: ${req.params.id}`);
});

// // POST - create a single post
exports.POST_ONE_POST = [
  isUser,
  body("title", "Title must be filled out")
    .trim()
    .escape()
    .isLength({ min: 3 }),
  body("blog", "Blog must filled out").trim().escape().isLength({ min: 100 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);

    // Returns error from invalid form.
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        msg: errors.array(),
      });
    }

    // Creates a 8 character id
    var shortId = nanoid(8);
    var uniqueId = false;

    // Checks if id is unique in the database.
    while (!uniqueId) {
      const post = await Post.findOne({ shortId: shortId });

      // Attempt creating new id.
      if (post) {
        shortId = nanoid(8);
      }
      // Id is unique, exit.
      else {
        uniqueId = true;
      }
    }

    // Get date at time of creating post.
    const post_created_date = new Date().toISOString();

    // Creates a post Object.
    const post = new Post({
      title: req.body.title,
      post: req.body.blog,
      date: post_created_date,
      author: req.user,
      published: true,
      shortId: shortId,
    });

    try {
      await post.save();

      return res.status(200).json({
        success: true,
        post: post,
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        msg: "Could not save post to server.",
      });
    }
  }),
];

// // PUT - update a single post
exports.PUT_ONE_POST = asyncHandler(async (req, res, next) => {
  return res.send(`PUT - update a single post - ID: ${req.params.id}`);
});

// // DELETE - delete a single post
exports.DELETE_ONE_POST = asyncHandler(async (req, res, next) => {
  return res.send(`DELETE - delete a single post - ID: ${req.params.id}`);
});
