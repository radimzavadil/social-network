const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const ActivityEvent = require("../models/ActivityEvent");

const isConnected = () => mongoose.connection.readyState === 1;

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 5) return "právě teď";
  if (diff < 60) return `před ${diff} sekundami`;
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `před ${m} ${m === 1 ? "minutou" : "minutami"}`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `před ${h} ${h === 1 ? "hodinou" : "hodinami"}`;
  }
  const d = Math.floor(diff / 86400);
  return `před ${d} ${d === 1 ? "dnem" : "dny"}`;
}

const FIELD_LABELS = {
  status: "Status",
  college: "School",
  residence: "Residence",
  hometown: "Home Town",
  highSchool: "High School",
  relationshipStatus: "Relationship Status",
  politicalViews: "Political Views",
  lookingFor: "Looking For",
  birthday: "Birthday",
};

exports.getFeed = async (req, res) => {
  if (!isConnected()) {
    return res.render("feed/index", {
      feedItems: [],
      currentUser: null,
      dbError: true,
      timeAgo,
    });
  }
  try {
    const [posts, events, currentUser] = await Promise.all([
      Post.find()
        .populate("author", "username fullName avatar")
        .sort({ createdAt: -1 })
        .limit(50),
      ActivityEvent.find()
        .populate("actor", "username fullName avatar")
        .sort({ createdAt: -1 })
        .limit(100),
      User.findById(req.session.user.id),
    ]);

    // Merge and sort by date desc
    const feedItems = [
      ...posts.map((p) => ({ kind: "post", data: p, createdAt: p.createdAt })),
      ...events.map((e) => ({
        kind: "activity",
        data: e,
        createdAt: e.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 60);

    res.render("feed/index", {
      feedItems,
      currentUser,
      dbError: false,
      timeAgo,
      FIELD_LABELS,
    });
  } catch (error) {
    console.error(error);
    res.render("feed/index", {
      feedItems: [],
      currentUser: null,
      dbError: true,
      timeAgo,
      FIELD_LABELS,
    });
  }
};

exports.createPost = async (req, res) => {
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.redirect("/feed");

    const postData = {
      author: req.session.user.id,
      content: content.trim(),
    };

    if (req.file) {
      postData.image = "/uploads/" + req.file.filename;
    }

    await Post.create(postData);
    res.redirect("/feed");
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při vytváření příspěvku.");
  }
};

exports.updatePost = async (req, res) => {
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).send("Příspěvek nenalezen.");

    // Authorization check
    if (post.author.toString() !== req.session.user.id) {
      return res.status(403).send("Nejste autorem tohoto příspěvku.");
    }

    if (content && content.trim()) {
      post.content = content.trim();
    }

    if (req.file) {
      post.image = "/uploads/" + req.file.filename;
    }

    await post.save();

    res.redirect("/feed");
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při úpravě příspěvku.");
  }
};

exports.deletePost = async (req, res) => {
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Příspěvek nenalezen.");

    // Authorization check (author or admin)
    if (
      post.author.toString() !== req.session.user.id &&
      req.session.user.role !== "admin"
    ) {
      return res.status(403).send("Nejste oprávněni smazat tento příspěvek.");
    }

    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/feed");
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při mazání příspěvku.");
  }
};
