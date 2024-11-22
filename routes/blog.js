var express = require("express");
var router = express.Router();

const blog_controller = require("../controllers/blogController");

// Routes for resources
router.get("/", blog_controller.GET_ALL_BLOGS);
router.get("/:id", blog_controller.GET_ONE_BLOG);
router.post("/", blog_controller.POST_ONE_BLOG);
router.put("/:id", blog_controller.PUT_ONE_BLOG);
router.delete("/:id", blog_controller.DELETE_ONE_BLOG);
router.get("/draft/:id", blog_controller.GET_ONE_DRAFT);
router.put("/toggle/:id", blog_controller.TOGGLE_VISIBILITY);

module.exports = router;
