const express = require("express"); 
const router = express.Router(); 
 
const adminController = require("../controllers/adminController"); 
const requireAdmin = require("../middlewares/adminMiddleware"); 
 
router.get("/users", requireAdmin, adminController.getUsers); 
 
router.post("/users/:id/role", requireAdmin, adminController.changeRole); 
 
module.exports = router; 