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
exports.POST_ONE_POST = asyncHandler(async (req, res, next) => {
  return res.send(
    `POST - create a single post - Title: ${req.body.title} - Post: ${req.body.post}`
  );
});

// // PUT - update a single post
exports.PUT_ONE_POST = asyncHandler(async (req, res, next) => {
  return res.send(`PUT - update a single post - ID: ${req.params.id}`);
});

// // DELETE - delete a single post
exports.DELETE_ONE_POST = asyncHandler(async (req, res, next) => {
  return res.send(`DELETE - delete a single post - ID: ${req.params.id}`);
});
