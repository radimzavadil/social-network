const mongoose = require("mongoose");
const User = require("../models/User");

const isConnected = () => mongoose.connection.readyState === 1;

// GET /profile
exports.showProfile = async (req, res) => {
    if (!isConnected()) return res.status(503).send("Databáze není připojena.");
    try {
        const user = await User.findById(req.session.user.id).populate("friends");
        if (!user) return res.redirect("/login");
        res.render("profile/show", { profileUser: user });
    } catch (err) {
        res.status(500).send("Chyba při načítání profilu.");
    }
};

// GET /profile/edit
exports.showEdit = async (req, res) => {
    if (!isConnected()) return res.status(503).send("Databáze není připojena.");
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect("/login");
        res.render("profile/edit", { profileUser: user, success: false });
    } catch (err) {
        res.status(500).send("Chyba při načítání profilu.");
    }
};

// POST /profile/edit
exports.updateProfile = async (req, res) => {
    if (!isConnected()) return res.status(503).send("Databáze není připojena.");
    try {
        const fields = [
            "fullName", "college", "status", "sex", "residence", "birthday",
            "hometown", "highSchool", "email", "screenname", "mobile", "websites",
            "bio", "lookingFor", "interestedIn", "relationshipStatus",
            "politicalViews", "interests", "favoriteMusic", "favoriteMovies"
        ];
        const update = {};
        fields.forEach(f => { update[f] = req.body[f] || ""; });

        await User.findByIdAndUpdate(req.session.user.id, update);
        const user = await User.findById(req.session.user.id);
        res.render("profile/edit", { profileUser: user, success: true });
    } catch (err) {
        res.status(500).send("Chyba při ukládání profilu.");
    }
};

// POST /profile/avatar
exports.uploadAvatar = async (req, res) => {
    if (!isConnected()) return res.status(503).send("Databáze není připojena.");
    try {
        if (req.file) {
            await User.findByIdAndUpdate(req.session.user.id, {
                avatar: "/uploads/" + req.file.filename
            });
        }
        res.redirect("/profile");
    } catch (err) {
        res.status(500).send("Chyba při nahrávání obrázku.");
    }
};