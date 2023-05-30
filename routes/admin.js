const express = require("express");
const router = express.Router();

//--> ADMIN LOGIN
const adminModel = require("../models/admin"); // Import the Admin model
const Users = require("../models/user"); // Import the Admin model

router.get("/admin/login", function (req, res) {
  res.render("adminlogin"); // Assuming "adminlogin.ejs" is the correct view file
});

router.post("/admin/home", function (req, res) {
  const { username, password } = req.body;

  // Find the admin with the provided username and password
  adminModel.find((err, admin) => {
    // console.log(admin);
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (username === admin[0].username && password === admin[0].password) {
      res.redirect("/admin/home");
    } else {
      res.status(401).send("Invalid username or password");
    }
  });
});

router.get("/admin/home", async (req, res) => {
  const user = await Users.find();
  res.render("adminhome", { users: user });
});

router.get("/delete/:id", async (req, res) => {
  const userID = req.params.id;
  try {
    await Users.findByIdAndDelete(userID);
    res.send(
      '<script>alert("User deleted successfully"); window.location.href="/admin/home";</script>'
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
