var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");

// Routes for resources
router.get("/", user_controller.GET_ALL_USERS);
router.get("/:userId", user_controller.GET_ONE_USER);
router.post("/", user_controller.POST_ONE_USER);
router.put("/:userId", user_controller.PUT_ONE_USER);
router.delete("/:userId", user_controller.DELETE_ONE_USER);

module.exports = router;
