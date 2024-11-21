const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const Blog = require("../models/Blog");

const isUser = require("../lib/authenticateUtil").isUser;

const { nanoid } = require("nanoid");

// Post Routes
// GET - get all blogs
exports.GET_ALL_BLOGS = asyncHandler(async (req, res, next) => {
  const currentPage = parseInt(req.query.currentPage) || 1; // Default 1
  const blogsPerPage = parseInt(req.query.blogsPerPage) || 5; // Default 5
  const blogsSkipped = (currentPage - 1) * blogsPerPage;

  // Note: _id: 1 is added to sort becuase MongoDB will sometimes need
  // a field with a unique value if documents are the same.
  // It would be possible for dates to be equal.
  // The additional _id field helps to sort properly.
  // Query: This query gets a collection of blogs, as well as the
  // blog author's display_real_name setting.
  const multipleBlogs = await Blog.find({ published: true })
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

  const totalBlogCount = await Blog.countDocuments({ published: true });

  const totalPages = Math.ceil(totalBlogCount / blogsPerPage);

  // If user is currently on a higher page number than what is currently available,
  // changes the currentPage to the last page.
  const newCurrentPage = currentPage > totalPages ? totalPages : currentPage;

  // Edits the blogs's author field to display the real name or last name depending on author's preferences.
  const userBlogsWithAuthorName = multipleBlogs.map((blog) => {
    // Sets displayed name.
    // If preferences don't exist, default to username.
    const displayName =
      blog.author.user_preferences === null
        ? blog.author.username
        : blog.author.user_preferences.display_real_name
        ? `${blog.author.first_name} ${blog.author.last_name}`
        : blog.author.username;

    // toObject() converts blog into a plain-old javascript object.
    return {
      ...blog.toObject(),
      author: displayName,
      authorID: blog.author._id,
    };
  });

  return res.status(200).json({
    multipleBlogs: userBlogsWithAuthorName,
    totalBlogCount,
    newCurrentPage,
  });
});

// GET - get a single blog
exports.GET_ONE_BLOG = asyncHandler(async (req, res, next) => {
  try {
    // Gets a single post and populate's the author's display_real_name preference
    const blog = await Blog.findOne({ shortId: req.params.id }).populate({
      path: "author",
      populate: {
        path: "user_preferences",
        select: "display_real_name",
      },
    });

    // Checks if the logged in user is the same user of the data being requested.
    // MongoDB ObjectId needs to be converted to string.
    // If user is not logged in or not owner of the blog, isBlogOwner = false.
    const isBlogOwner =
      req.user === undefined
        ? false
        : req.user._id.toString() !== blog.author._id.toString()
        ? false
        : true;

    // Prevents a user from seeing an unpublished blog if they are not the owner.
    if (!isBlogOwner && !blog.published) {
      return res.status(500).json({
        error: true,
        message: "Could not retrieve blog.",
      });
    }

    // Gets the appropriate display name based on user's preference.
    const displayName =
      blog.author.user_preferences === null
        ? blog.author.username
        : blog.author.user_preferences.display_real_name
        ? `${blog.author.first_name} ${blog.author.last_name}`
        : blog.author.username;

    const blogWithAuthorName = {
      ...blog.toObject(),
      author: displayName,
      authorID: blog.author._id,
      isBlogOwner,
    };

    return res.status(200).json({ blog: blogWithAuthorName });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Could not retrieve blog.",
    });
  }
});

// // POST - create a single blog
exports.POST_ONE_BLOG = [
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
      const blog = await Blog.findOne({ shortId: shortId });

      // Attempt creating new id.
      if (blog) {
        shortId = nanoid(8);
      }
      // Id is unique, exit.
      else {
        uniqueId = true;
      }
    }

    // Get date at time of creating blog.
    const blog_created_date = new Date().toISOString();

    // Creates a blog Object.
    const blog = new Blog({
      title: req.body.title,
      blog: req.body.blog,
      date: blog_created_date,
      author: req.user,
      published: true,
      shortId: shortId,
    });

    try {
      // Saves the blog
      await blog.save();

      // Saves the blog to the User.
      const filter = { _id: req.user._id };
      const update = { $push: { blogs: blog } };
      await User.findOneAndUpdate(filter, update, { new: true });

      return res.status(200).json({
        success: true,
        blog: blog,
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        msg: ["Could not save blog to server."],
      });
    }
  }),
];

// // PUT - update a single blog
exports.PUT_ONE_BLOG = asyncHandler(async (req, res, next) => {
  return res.send(`PUT - update a single blog - ID: ${req.params.id}`);
});

// // DELETE - delete a single blog
exports.DELETE_ONE_BLOG = asyncHandler(async (req, res, next) => {
  return res.send(`DELETE - delete a single blog - ID: ${req.params.id}`);
});
