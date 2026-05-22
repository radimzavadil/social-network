const mongoose = require("mongoose");

// type: "profile_edit", "birthday_edit", "wall_post", "friend_added"
// meta: { field, oldValue, newValue, targetUsername, wallTargetUsername }
const activitySchema = new mongoose.Schema({
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("ActivityEvent", activitySchema);