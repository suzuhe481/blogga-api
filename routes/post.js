var express = require("express");
var router = express.Router();

const post_controller = require("../controllers/postController");

// Routes for resources
router.get("/", post_controller.GET_ALL_POSTS);
router.get("/:postId", post_controller.GET_ONE_POST);
router.post("/", post_controller.POST_ONE_POST);
router.put("/:postId", post_controller.PUT_ONE_POST);
router.delete("/:postId", post_controller.DELETE_ONE_POST);

module.exports = router;
