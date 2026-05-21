const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const profileController = require("../controllers/profileController");
const requireLogin = require("../middlewares/authMiddleware");

// Multer – store avatars in public/uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads/"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, "avatar_" + req.session.user.id + "_" + Date.now() + ext);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
            allowed.test(file.mimetype);
        ok ? cb(null, true) : cb(new Error("Only image files are allowed."));
    }
});

router.get("/", requireLogin, profileController.showProfile);
router.get("/edit", requireLogin, profileController.showEdit);
router.post("/edit", requireLogin, profileController.updateProfile);
router.post("/avatar", requireLogin, upload.single("avatar"), profileController.uploadAvatar);

module.exports = router;