// admin.js (or the file where your models are defined)
const mongoose = require("mongoose");

// Define the schema for the admin collection
const adminSchema = mongoose.Schema({
  username: String,
  password: String,
});

// Create the admin model
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
