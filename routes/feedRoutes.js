const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");
const requireLogin = require("../middlewares/authMiddleware");

router.get("/", requireLogin, feedController.getFeed);
router.post("/", requireLogin, feedController.createPost);

module.exports = router;