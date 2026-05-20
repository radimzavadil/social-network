const mongoose = require("mongoose");
const connectDB = async () => {
 try {
   await mongoose.connect(process.env.MONGO_URI);
   console.log("MongoDB připojena");
 } catch (error) {
   console.error("Chyba připojení k MongoDB:", error.message);
   console.log("Aplikace pokračuje v běhu bez databáze...");
 }
};
module.exports = connectDB;