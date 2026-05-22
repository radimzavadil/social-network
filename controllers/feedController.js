const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

const isConnected = () => mongoose.connection.readyState === 1;

function timeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 5) return "právě teď";
    if (diff < 60) return `před ${diff} sekundami`;
    if (diff < 3600) {
        const m = Math.floor(diff / 60);
        return `před ${m} ${m === 1 ? "minutou" : m < 5 ? "minutami" : "minutami"}`;
    }
    if (diff < 86400) {
        const h = Math.floor(diff / 3600);
        return `před ${h} ${h === 1 ? "hodinou" : h < 5 ? "hodinami" : "hodinami"}`;
    }
    const d = Math.floor(diff / 86400);
    return `před ${d} ${d === 1 ? "dnem" : d < 5 ? "dny" : "dny"}`;
}

exports.getFeed = async (req, res) => {
    if (!isConnected()) {
        return res.render("feed/index", { posts: [], currentUser: null, dbError: true, timeAgo });
    }
    try {
        const [posts, currentUser] = await Promise.all([
            Post.find()
                .populate("author", "username fullName avatar")
                .sort({ createdAt: -1 }),
            User.findById(req.session.user.id)
        ]);
        res.render("feed/index", { posts, currentUser, dbError: false, timeAgo });
    } catch (error) {
        console.error(error);
        res.render("feed/index", { posts: [], currentUser: null, dbError: true, timeAgo });
    }
};

exports.createPost = async (req, res) => {
    if (!isConnected()) {
        return res.status(503).send("Databáze není připojena.");
    }
    try {
        const { content } = req.body;
        if (!content || !content.trim()) return res.redirect("/feed");
        await Post.create({
            author: req.session.user.id,
            content: content.trim()
        });
        res.redirect("/feed");
    } catch (error) {
        console.error(error);
        res.status(500).send("Chyba při vytváření příspěvku.");
    }
};