const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const isConnected = () => mongoose.connection.readyState === 1;

exports.showRegister = (req, res) => {
  res.render("auth/register", { activePage: "register" });
};

exports.register = async (req, res) => {
  if (!isConnected()) {
    return res
      .status(503)
      .send("Databáze není připojena. Registrace je dočasně nedostupná.");
  }
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send("Uživatel už existuje");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: "user",
    });
    // Auto-login after register and redirect to profile
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
    };
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Chyba při registraci.");
  }
};

exports.showLogin = (req, res) => {
  res.render("auth/login", { activePage: "login" });
};

exports.login = async (req, res) => {
  if (!isConnected()) {
    return res
      .status(503)
      .send("Databáze není připojena. Přihlášení je dočasně nedostupné.");
  }
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.send("Uživatel neexistuje");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send("Špatné heslo");
    }
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };
    // Redirect to profile page
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Chyba při přihlašování.");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Chyba při mazání relace:", err);
      return res.redirect("/feed");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  }); // <-- Make sure this is closed right!
};
