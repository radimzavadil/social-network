const mongoose = require("mongoose");
const User = require("../models/User");

const isConnected = () => mongoose.connection.readyState === 1;

exports.getProfile = async (req, res) => {
    if (!isConnected()) {
        // Fallback to show if you don't want it rendering the index during database failures
        return res.render("profile/show", { profileUser: null, user: null, dbError: true });
    }
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect("/login");

        // RENDER show instead of index, and supply both user profiles variables
        res.render("profile/show", {
            profileUser: user,
            user: user, // Passed down so the EJS client knows you own this profile
            dbError: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba při načítání profilu.");
    }
};

exports.getEditProfile = async (req, res) => {
    if (!isConnected()) {
        return res.redirect("/profile");
    }
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect("/login");
        res.render("profile/edit", { profileUser: user, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba.");
    }
};

exports.updateProfile = async (req, res) => {
    if (!isConnected()) {
        return res.status(503).send("Databáze není připojena.");
    }
    try {
        const {
            fullName, accessLocation, college, status, sex, residence,
            birthday, hometown, highSchool, screenname, mobile,
            websites, lookingFor, interestedIn, relationshipStatus,
            politicalViews, interests, favoriteMusic, favoriteMovies, bio
        } = req.body;

        const updateData = {
            fullName: fullName || "",
            accessLocation: accessLocation || "",
            college: college || "",
            status: status || "",
            sex: sex || "",
            residence: residence || "",
            birthday: birthday || "",
            hometown: hometown || "",
            highSchool: highSchool || "",
            screenname: screenname || "",
            mobile: mobile || "",
            websites: websites || "",
            lookingFor: lookingFor || "",
            interestedIn: interestedIn || "",
            relationshipStatus: relationshipStatus || "",
            politicalViews: politicalViews || "",
            interests: interests || "",
            favoriteMusic: favoriteMusic || "",
            favoriteMovies: favoriteMovies || "",
            bio: bio || ""
        };

        if (req.file) {
            updateData.avatar = "/uploads/" + req.file.filename;
        }

        await User.findByIdAndUpdate(req.session.user.id, updateData, { new: true });
        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba při aktualizaci profilu.");
    }
};