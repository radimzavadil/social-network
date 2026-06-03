const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const requireLogin = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.get("/", requireLogin, profileController.getProfile);
router.get("/search", requireLogin, profileController.searchUsers);
router.get("/edit", requireLogin, profileController.getEditProfile);
router.post(
  "/edit",
  requireLogin,
  upload.single("avatar"),
  profileController.updateProfile,
);
router.post(
  "/wall",
  requireLogin,
  upload.single("image"),
  profileController.postWall,
);
router.put(
  "/wall/:id",
  requireLogin,
  upload.single("image"),
  profileController.updateWallPost,
);
router.delete("/wall/:id", requireLogin, profileController.deleteWallPost);
router.get("/:username", requireLogin, profileController.getProfileByUsername);

module.exports = router;
