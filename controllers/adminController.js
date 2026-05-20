const mongoose = require("mongoose");
const User = require("../models/User"); 

const isConnected = () => mongoose.connection.readyState === 1;

exports.getUsers = async (req, res) => { 
  if (!isConnected()) {
    return res.render("admin/users", { users: [], dbError: true });
  }
  try {
    const users = await User.find().sort({ username: 1 }); 
    res.render("admin/users", { users, dbError: false }); 
  } catch (error) {
    res.render("admin/users", { users: [], dbError: true }); 
  }
}; 

exports.changeRole = async (req, res) => { 
  if (!isConnected()) {
    return res.status(503).send("Databáze není připojena.");
  }
  try {
    const { role } = req.body; 
    await User.findByIdAndUpdate(req.params.id, { role }); 
    res.redirect("/admin/users"); 
  } catch (error) {
    res.status(500).send("Chyba při změně role.");
  }
};