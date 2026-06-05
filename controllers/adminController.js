const mongoose = require("mongoose");
const User = require("../models/User");

const isConnected = () => mongoose.connection.readyState === 1;

exports.getUsers = async (req, res) => {
  if (!isConnected()) {
    return res.render("admin/users", {
      users: [],
      dbError: true,
      activePage: "admin",
    });
  }
  try {
    const users = await User.find().sort({ username: 1 });
    res.render("admin/users", { users, dbError: false, activePage: "admin" });
  } catch (error) {
    res.render("admin/users", {
      users: [],
      dbError: true,
      activePage: "admin",
    });
  }
};

exports.changeRole = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Database is not connected.");
  }
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).send("Error while changing role.");
  }
};

exports.deleteUser = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Database is not connected.");
  }
  try {
    const userId = req.params.id;
    // Prevent admin from deleting themselves if needed, or just allow it.
    // For safety, we can check: if (req.session.user.id === userId) ...
    await User.findByIdAndDelete(userId);
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).send("Error while deleting user.");
  }
};
