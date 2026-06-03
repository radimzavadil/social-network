const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");
const requireLogin = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.get("/", requireLogin, feedController.getFeed);
router.post(
  "/",
  requireLogin,
  upload.single("image"),
  feedController.createPost,
);
router.put(
  "/:id",
  requireLogin,
  upload.single("image"),
  feedController.updatePost,
);
router.delete("/:id", requireLogin, feedController.deletePost);

module.exports = router;
