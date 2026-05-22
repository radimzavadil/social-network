require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const feedRoutes = require("./routes/feedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const friendRoutes = require("./routes/friendRoutes");

const app = express();

connectDB();

const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Method override (PUT, DELETE via forms)
app.use(methodOverride("_method"));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || "tajny-klic-123",
    resave: false,
    saveUninitialized: false
}));

// Make session user available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use("/admin", adminRoutes);
app.use("/feed", feedRoutes);
app.use("/profile", profileRoutes);
app.use("/friends", friendRoutes);
app.use("/", authRoutes);

// Home / Landing Page
app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/feed");
    }
    res.render("index");
});

app.listen(PORT, () => {
    console.log(`Server běží na adrese http://localhost:${PORT}`);
});