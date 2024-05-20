var express = require("express");
var router = express.Router();

const comment_controller = require("../controllers/commentController");

// Routes for resources
router.get("/", comment_controller.GET_ALL_COMMENTS);
router.get("/:id", comment_controller.GET_ONE_COMMENT);
router.post("/", comment_controller.POST_ONE_COMMENT);
router.put("/:id", comment_controller.PUT_ONE_COMMENT);
router.delete("/:id", comment_controller.DELETE_ONE_COMMENT);

module.exports = router;
