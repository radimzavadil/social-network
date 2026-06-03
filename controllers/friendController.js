const mongoose = require("mongoose");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

const isConnected = () => mongoose.connection.readyState === 1;

// POST /friends/send/:toUsername
exports.sendRequest = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Databáze není připojena.");
  }
  try {
    const sender = await User.findById(req.session.user.id);
    const recipient = await User.findOne({ username: req.params.toUsername });

    if (!recipient) {
      return res.status(404).send("Uživatel nenalezen.");
    }

    if (recipient._id.toString() === sender._id.toString()) {
      return res.redirect("/profile");
    }

    // Check if a request already exists
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: sender._id, recipient: recipient._id },
        { sender: recipient._id, recipient: sender._id },
      ],
    });

    if (!existing) {
      await FriendRequest.create({
        sender: sender._id,
        recipient: recipient._id,
        status: "pending",
      });
    }

    res.redirect("/profile/" + recipient.username);
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při odesílání žádosti.");
  }
};

// GET /friends/requests
exports.getRequests = async (req, res) => {
  if (!isConnected()) {
    return res.render("friends/requests", {
      requests: [],
      user: null,
      dbError: true,
    });
  }
  try {
    const sessionUser = await User.findById(req.session.user.id);
    const requests = await FriendRequest.find({
      recipient: sessionUser._id,
      status: "pending",
    }).populate("sender", "username fullName avatar college");

    res.render("friends/requests", {
      requests,
      user: sessionUser,
      dbError: false,
      activePage: "profile",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při načítání žádostí.");
  }
};

// POST /friends/accept/:requestId
exports.acceptRequest = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Databáze není připojena.");
  }
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.redirect("/friends/requests");

    // Make sure only the recipient can accept
    if (request.recipient.toString() !== req.session.user.id) {
      return res.status(403).send("Přístup zamítnut.");
    }

    request.status = "accepted";
    await request.save();

    // Add each user to the other's friends list (avoid duplicates)
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.recipient },
    });
    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender },
    });

    res.redirect("/friends/requests");
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při přijímání žádosti.");
  }
};

// POST /friends/deny/:requestId
exports.denyRequest = async (req, res) => {
  if (!isConnected()) {
    return res.status(503).send("Databáze není připojena.");
  }
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.redirect("/friends/requests");

    if (request.recipient.toString() !== req.session.user.id) {
      return res.status(403).send("Přístup zamítnut.");
    }

    request.status = "rejected";
    await request.save();

    res.redirect("/friends/requests");
  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při odmítání žádosti.");
  }
};
