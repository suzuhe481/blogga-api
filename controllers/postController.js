const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const Post = require("../models/Post");

const isUser = require("../lib/authenticateUtil").isUser;

const { nanoid } = require("nanoid");

// Post Routes
// GET - get all posts
exports.GET_ALL_POSTS = asyncHandler(async (req, res, next) => {
  const currentPage = parseInt(req.query.currentPage) || 1; // Default 1
  const blogsPerPage = parseInt(req.query.blogsPerPage) || 5; // Default 5
  const blogsSkipped = (currentPage - 1) * blogsPerPage;

  const totalBlogCount = await Post.countDocuments({});

  const totalPages = Math.ceil(totalBlogCount / blogsPerPage);

  // If user is currently on a higher page number than what is currently available,
  // changes the currentPage to the last page.
  const newCurrentPage = currentPage > totalPages ? totalPages : currentPage;

  // Note: _id: 1 is added to sort becuase MongoDB will sometimes need
  // a field with a unique value if documents are the same.
  // It would be possible for dates to be equal.
  // The additional _id field helps to sort properly.
  // Query: This query gets a collection of posts, as well as the
  // post author's display_real_name setting.
  const multiplePosts = await Post.find({})
    .populate({
      path: "author",
      populate: {
        path: "user_preferences",
        select: "display_real_name",
      },
    })
    .sort({ date: -1, _id: 1 })
    .skip(blogsSkipped)
    .limit(blogsPerPage)
    .exec();

  // Edits the post's author field to display the real name or last name depending on author's preferences.
  const userPostsWithAuthorName = multiplePosts.map((post) => {
    // Sets displayed name.
    // If preferences don't exist, default to username.
    const displayName =
      post.author.user_preferences === null
        ? post.author.username
        : post.author.user_preferences.display_real_name
        ? `${post.author.first_name} ${post.author.last_name}`
        : post.author.username;

    // toObject() converts post into a plain-old javascript object.
    return {
      ...post.toObject(),
      author: displayName,
      authorID: post.author._id,
    };
  });

  return res.status(200).json({
    multiplePosts: userPostsWithAuthorName,
    totalBlogCount,
    newCurrentPage,
  });
});

// GET - get a single post
exports.GET_ONE_POST = asyncHandler(async (req, res, next) => {
  try {
    // Gets a single post and populate's the author's display_real_name preference
    const post = await Post.findOne({ shortId: req.params.id }).populate({
      path: "author",
      populate: {
        path: "user_preferences",
        select: "display_real_name",
      },
    });

    // Gets the appropriate display name based on user's preference.
    const displayName =
      post.author.user_preferences === null
        ? post.author.username
        : post.author.user_preferences.display_real_name
        ? `${post.author.first_name} ${post.author.last_name}`
        : post.author.username;

    const postWithAuthorName = {
      ...post.toObject(),
      author: displayName,
      authorID: post.author._id,
    };

    return res.status(200).json({ post: postWithAuthorName });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Could not retrieve blog.",
    });
  }
});

// // POST - create a single post
exports.POST_ONE_POST = [
  isUser,
  body("title", "Title is empty or too short")
    .trim()
    .escape()
    .isLength({ min: 3 }),
  body("blog", "Blog is empty or too short")
    .trim()
    .escape()
    .isLength({ min: 50 }),

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
      // Saves the post
      await post.save();

      // Saves the post to the User.
      const filter = { _id: req.user._id };
      const update = { $push: { posts: post } };
      await User.findOneAndUpdate(filter, update, { new: true });

      return res.status(200).json({
        success: true,
        post: post,
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        msg: ["Could not save post to server."],
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
