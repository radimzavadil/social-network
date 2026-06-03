const mongoose = require("mongoose");
const User = require("../models/User");
const WallPost = require("../models/Wallpost");
const ActivityEvent = require("../models/ActivityEvent");

const isConnected = () => mongoose.connection.readyState === 1;

// Fields that trigger activity events when changed
const TRACKED_FIELDS = {
  status: "profile_edit",
  college: "profile_edit",
  residence: "profile_edit",
  hometown: "profile_edit",
  highSchool: "profile_edit",
  relationshipStatus: "profile_edit",
  birthday: "birthday_edit",
  politicalViews: "profile_edit",
  lookingFor: "profile_edit",
};

exports.getProfile = async (req, res) => {
  if (!isConnected()) {
    return res.render("profile/show", {
      profileUser: null,
      user: null,
      wallPosts: [],
      mutualCount: 0,
      dbError: true,
    });
  }
  try {
    const user = await User.findById(req.session.user.id).populate(
      "friends",
      "username fullName avatar",
    );
    if (!user) return res.redirect("/login");
    const wallPosts = await WallPost.find({ profile: user._id })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });
    res.render("profile/show", {
      profileUser: user,
      user,
      wallPosts,
      mutualCount: 0,
      dbError: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při načítání profilu.");
  }
};

exports.getProfileByUsername = async (req, res) => {
  if (!isConnected()) {
    return res.render("profile/show", {
      profileUser: null,
      user: null,
      wallPosts: [],
      mutualCount: 0,
      dbError: true,
    });
  }
  try {
    const profileUser = await User.findOne({
      username: req.params.username,
    }).populate("friends", "username fullName avatar");
    if (!profileUser) return res.status(404).send("Uživatel nenalezen.");
    const currentUser = await User.findById(req.session.user.id).populate(
      "friends",
      "_id",
    );
    const wallPosts = await WallPost.find({ profile: profileUser._id })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });
    // Mutual friends: intersection of both friends arrays
    const myFriendIds = new Set(
      (currentUser.friends || []).map((f) => f._id.toString()),
    );
    const mutualCount = (profileUser.friends || []).filter((f) =>
      myFriendIds.has(f._id.toString()),
    ).length;
    res.render("profile/show", {
      profileUser,
      user: currentUser,
      wallPosts,
      mutualCount,
      dbError: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při načítání profilu.");
  }
};

exports.getEditProfile = async (req, res) => {
  if (!isConnected()) return res.redirect("/profile");
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
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const fields = [
      "fullName",
      "accessLocation",
      "college",
      "status",
      "sex",
      "residence",
      "birthday",
      "hometown",
      "highSchool",
      "screenname",
      "mobile",
      "websites",
      "lookingFor",
      "interestedIn",
      "relationshipStatus",
      "politicalViews",
      "interests",
      "favoriteMusic",
      "favoriteMovies",
      "bio",
    ];
    const updateData = {};
    fields.forEach((f) => (updateData[f] = req.body[f] || ""));
    if (req.file) updateData.avatar = "/uploads/" + req.file.filename;

    const oldUser = await User.findById(req.session.user.id);

    await User.findByIdAndUpdate(req.session.user.id, updateData, {
      new: true,
    });

    // Create activity events for changed tracked fields
    for (const [field, eventType] of Object.entries(TRACKED_FIELDS)) {
      const oldVal = (oldUser[field] || "").trim();
      const newVal = (updateData[field] || "").trim();
      if (newVal && newVal !== oldVal) {
        await ActivityEvent.create({
          actor: req.session.user.id,
          type: eventType,
          meta: { field, newValue: newVal },
        });
      }
    }

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při aktualizaci profilu.");
  }
};

exports.postWall = async (req, res) => {
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const { content, profileUserId } = req.body;
    if (!content || !content.trim()) return res.redirect("back");

    const wpData = {
      profile: profileUserId,
      author: req.session.user.id,
      content: content.trim(),
    };

    if (req.file) {
      wpData.image = "/uploads/" + req.file.filename;
    }

    await WallPost.create(wpData);

    // Find profile owner username for meta
    const profileOwner = await User.findById(profileUserId, "username");
    await ActivityEvent.create({
      actor: req.session.user.id,
      type: "wall_post",
      meta: { wallTargetUsername: profileOwner ? profileOwner.username : "" },
    });
    // Redirect back to the profile
    const profileUser = await User.findById(profileUserId, "username");
    if (profileUser) {
      res.redirect("/profile/" + profileUser.username);
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při odesílání zprávy na zeď.");
  }
};

exports.updateWallPost = async (req, res) => {
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const { content } = req.body;
    const wp = await WallPost.findById(req.params.id).populate(
      "profile",
      "username",
    );
    if (!wp) return res.status(404).send("Příspěvek nenalezen.");

    if (wp.author.toString() !== req.session.user.id) {
      return res.status(403).send("Nejste autorem tohoto příspěvku.");
    }

    if (content && content.trim()) {
      wp.content = content.trim();
    }

    if (req.file) {
      wp.image = "/uploads/" + req.file.filename;
    }

    await wp.save();

    res.redirect("/profile/" + wp.profile.username);
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při úpravě příspěvku.");
  }
};

exports.deleteWallPost = async (req, res) => {
  if (!isConnected()) return res.status(503).send("Databáze není připojena.");
  try {
    const wp = await WallPost.findById(req.params.id).populate(
      "profile",
      "username",
    );
    if (!wp) return res.status(404).send("Příspěvek nenalezen.");

    // Author of post, owner of profile, or admin
    const isAuthor = wp.author.toString() === req.session.user.id;
    const isProfileOwner = wp.profile._id.toString() === req.session.user.id;
    const isAdmin = req.session.user.role === "admin";

    if (!isAuthor && !isProfileOwner && !isAdmin) {
      return res.status(403).send("Nejste oprávněni smazat tento příspěvek.");
    }

    const username = wp.profile.username;
    await WallPost.findByIdAndDelete(req.params.id);
    res.redirect("/profile/" + username);
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při mazání příspěvku.");
  }
};
