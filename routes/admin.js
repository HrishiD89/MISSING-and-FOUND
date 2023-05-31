const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const path = require("path");
const multer = require("multer");

// Bring in Article Model
let Article = require("../models/article");
// Bring in User Model

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
  const admin = await adminModel.find();
  const user = await Users.find();
  res.render("adminhome", { users: user, admin: admin });
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

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/article/",
  filename: function (req, file, cb) {
    cb("", file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file");

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb("", true);
  } else {
    cb("Error: Images Only!");
  }
}

// Add Route
router.get("/admin/addarticle", function (req, res) {
  res.render("admin_addarticle", {
    title: "Add Article",
  });
});

//single submit
router.post("/admin/addarticle", upload, function (req, res) {
  let article = new Article();
  article.title = req.body.title;
  article.author = "admin007";

  article.body = req.body.body;

  if (req.file === undefined) {
    req.file = "noImage";
    req.file.filename = "noImage";
  }
  article.file = req.file.filename;

  article.save(function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Added Admin");
      res.redirect("/admin/addarticle");
    }
  });
});

module.exports = router;
