const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Basic
    fullName: { type: String, default: "" },
    avatar: { type: String, default: "" },
    college: { type: String, default: "" },
    status: { type: String, default: "" },
    sex: { type: String, default: "" },
    residence: { type: String, default: "" },
    birthday: { type: String, default: "" },
    hometown: { type: String, default: "" },
    highSchool: { type: String, default: "" },

    // Contact
    email: { type: String, default: "" },
    screenname: { type: String, default: "" },
    mobile: { type: String, default: "" },
    websites: { type: String, default: "" },   // newline-separated URLs

    // Personal
    bio: { type: String, default: "" },
    lookingFor: { type: String, default: "" },
    interestedIn: { type: String, default: "" },
    relationshipStatus: { type: String, default: "" },
    politicalViews: { type: String, default: "" },
    interests: { type: String, default: "" },
    favoriteMusic: { type: String, default: "" },
    favoriteMovies: { type: String, default: "" },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);