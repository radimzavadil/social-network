require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const promoteUser = async (username) => {
  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { username: username },
      { role: "admin" },
      { new: true }
    );
    if (user) {
      console.log(`Success: User ${username} is now an admin.`);
    } else {
      console.log(`Error: User ${username} not found.`);
    }
    mongoose.connection.close();
  } catch (error) {
    console.error("Error promoting user:", error);
    process.exit(1);
  }
};

const username = process.argv[2];
if (!username) {
  console.log("Please provide a username: node promote-admin.js <username>");
  process.exit(1);
}

promoteUser(username);
