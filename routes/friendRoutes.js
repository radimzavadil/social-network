const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const requireLogin = require("../middlewares/authMiddleware");

// Send a friend request
router.post("/send/:toUsername", requireLogin, friendController.sendRequest);

// Page: view incoming requests
router.get("/requests", requireLogin, friendController.getRequests);

// Accept or deny
router.post("/accept/:requestId", requireLogin, friendController.acceptRequest);
router.post("/deny/:requestId", requireLogin, friendController.denyRequest);

module.exports = router;