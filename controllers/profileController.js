const mongoose = require("mongoose");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

const isConnected = () => mongoose.connection.readyState === 1;

// My own profile
exports.getProfile = async (req, res) => {
    if (!isConnected()) {
        return res.render("profile/show", { profileUser: null, user: null, dbError: true, friendStatus: null });
    }
    try {
        const user = await User.findById(req.session.user.id).populate("friends", "username fullName avatar");
        if (!user) return res.redirect("/login");

        res.render("profile/show", {
            profileUser: user,
            user: user,
            dbError: false,
            friendStatus: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba při načítání profilu.");
    }
};

// Someone else's profile
exports.getPublicProfile = async (req, res) => {
    if (!isConnected()) {
        return res.render("profile/show", { profileUser: null, user: null, dbError: true, friendStatus: null });
    }
    try {
        const sessionUser = await User.findById(req.session.user.id);
        const profileUser = await User.findOne({ username: req.params.username })
            .populate("friends", "username fullName avatar");

        if (!profileUser) {
            return res.render("profile/notfound", { username: req.params.username, user: sessionUser });
        }

        // If it's their own profile, redirect to /profile
        if (profileUser._id.toString() === sessionUser._id.toString()) {
            return res.redirect("/profile");
        }

        // Check friend request status between these two users
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: sessionUser._id, recipient: profileUser._id },
                { sender: profileUser._id, recipient: sessionUser._id }
            ]
        });

        let friendStatus = null; // null = no relation
        if (existingRequest) {
            if (existingRequest.status === "accepted") {
                friendStatus = "friends";
            } else if (existingRequest.status === "pending") {
                if (existingRequest.sender.toString() === sessionUser._id.toString()) {
                    friendStatus = "sent"; // I sent the request
                } else {
                    friendStatus = "received"; // They sent me a request
                }
            } else if (existingRequest.status === "rejected") {
                friendStatus = "rejected";
            }
        }

        res.render("profile/show", {
            profileUser,
            user: sessionUser,
            dbError: false,
            friendStatus
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba při načítání profilu.");
    }
};

// Quick search
exports.searchProfile = async (req, res) => {
    if (!isConnected()) {
        return res.render("profile/searchresult", { results: [], query: "", user: null, dbError: true });
    }
    try {
        const query = (req.query.q || "").trim();
        const sessionUser = await User.findById(req.session.user.id);

        if (!query) {
            return res.redirect("/profile");
        }

        const results = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } }
            ]
        }).select("username fullName avatar college");

        res.render("profile/searchresult", { results, query, user: sessionUser, dbError: false });
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba při hledání.");
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