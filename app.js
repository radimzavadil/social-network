
require("dotenv").config();
const express = require("express");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); 

// Odstraněny staré útulkové routy


const path = require("path");
const session = require("express-session");
const app = express();

connectDB();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));



const methodOverride = require("method-override");
app.use(methodOverride("_method"));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
   }));
   app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
   });

app.use("/admin", adminRoutes); 
app.use("/", authRoutes);




app.get("/", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.send(`<h1>Úspěšně přihlášen!</h1><p>Vítej zpět, <strong>${req.session.user.username}</strong>.</p><form action="/logout" method="POST"><button type="submit">Odhlásit se</button></form>`);
});

app.listen(PORT, () => {
 console.log(`Server běží na adrese http://localhost:${PORT}`);
});
