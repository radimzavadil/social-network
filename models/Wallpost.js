const mongoose = require("mongoose");

const wallPostSchema = new mongoose.Schema({
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000 }
}, { timestamps: true });

module.exports = mongoose.model("WallPost", wallPostSchema);