const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const isConnected = () => mongoose.connection.readyState === 1;

// zobrazí registraci
exports.showRegister = (req, res) => {
 res.render("auth/register");
};

// registrace
exports.register = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Databáze není připojena. Registrace je dočasně nedostupná.");
  }
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send("Uživatel už existuje");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password: hashedPassword,
      role: "user"
    });
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Chyba při registraci.");
  }
};

// zobrazí login
exports.showLogin = (req, res) => {
 res.render("auth/login");
};

// login
exports.login = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Databáze není připojena. Přihlášení je dočasně nedostupné.");
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
      role: user.role
    };
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Chyba při přihlašování.");
  }
};

// logout
exports.logout = (req, res) => {
 req.session.destroy(() => {
   res.redirect("/login");
 });
};