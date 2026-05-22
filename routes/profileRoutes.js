const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const requireLogin = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.get("/", requireLogin, profileController.getProfile);
router.get("/edit", requireLogin, profileController.getEditProfile);
router.post("/edit", requireLogin, upload.single("avatar"), profileController.updateProfile);

// Search must come before /:username so it doesn't get captured
router.get("/search", requireLogin, profileController.searchProfile);

// View another user's profile
router.get("/:username", requireLogin, profileController.getPublicProfile);

module.exports = router;