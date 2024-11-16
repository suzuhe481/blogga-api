var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");

// Routes for resources
// GET ROUTES
router.get("/", user_controller.GET_ALL_USERS);
router.get("/name", user_controller.GET_SELF_NAME);
router.get("/settings", user_controller.GET_SETTINGS);
router.get("/:id", user_controller.GET_ONE_USER);
router.get("/blogs/:id", user_controller.GET_USER_BLOGS);

// PUT (UPDATE) ROUTES
router.put("/settings", user_controller.PUT_SETTINGS);
router.put("/settings-update-email", user_controller.PUT_EMAIL);
router.put("/settings-update-password", user_controller.PUT_PASSWORD);

// POST (CREATE) ROUTES
router.post("/", user_controller.POST_ONE_USER);

// DELETE ROUTES
router.delete("/", user_controller.DELETE_ONE_USER);

module.exports = router;
