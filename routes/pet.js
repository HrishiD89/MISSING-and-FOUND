const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const { check, validationResult } = require("express-validator");

// Bring in User Model
let User = require("../models/user");
// Bring in Pet Model
let Pet = require("../models/pet");

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/missing_pet/", //have to change to missing_pet
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

// Add Missing Pet Route
router.get("/add/missingPet", ensureAuthenticated, function (req, res) {
  res.render("add_missing_pet");
});

// Add Missing Pet Process
router.post(
  "/missingPet/:id",
  upload,
  ensureAuthenticated,
  [
    check("name", "Name is required").notEmpty(),
    check("age", "age is required").notEmpty(),
    check("size", "Size is required").notEmpty(),
    check("species", "Species is required").notEmpty(),
    check("breed", "Breed is required").notEmpty(),
    check("locationLastSeen", "locationLastSeen is required").notEmpty(),
    check("dateOfMissing", "Date of Missing is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
  ],
  function (req, res) {
    if (req.file === undefined) {
      req.file = "noImage";
      req.file.filename = "noImage";
    }
    const name = req.body.name;
    const species = req.body.species;
    const breed = req.body.breed;
    const gender = req.body.gender;
    const size = req.body.size;
    const age = req.body.age;
    const colors = req.body.colors;
    const locationLastSeen = req.body.locationLastSeen;
    const dateOfMissing = req.body.dateOfMissing;
    const country = req.body.country;
    const city = req.body.city;
    const currentStatus = req.body.currentStatus;
    const description = req.body.description;
    const file = req.file.filename;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("add_missing_pet", {
        errors: errors.array(),
        user: req.user,
      });
    } else {
      let newPet = new Pet({
        Name: name,
        Image: file,
        Age: age,
        Species: species,
        Breed: breed,
        Size: size,
        LastLocationSeen: locationLastSeen,
        City: city,
        Color: colors,
        DateOfMissing: dateOfMissing,
        Gender: gender,
        Country: country,
        CurrentStatus: currentStatus,
        Description: description,
        Author: req.user._id,
      });
      let query = { _id: req.params.id };
      let userUpdate = {};
      userUpdate.MissingPet = req.user.MissingPet + 1;
      User.update(query, userUpdate, function (err) {
        if (err) {
          console.log(err);
          return;
        }
      });
      newPet.save(function (err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Missing Pet Added");
          res.redirect("/");
        }
      });
    }
  }
);

// Load Individual Person Edit Form
router.get("/editPet/:id", ensureAuthenticated, function (req, res) {
  Pet.findById(req.params.id, function (err, pet) {
    res.render("edit_pet", {
      pet: pet,
      title: "Edit Pet",
    });
  });
});

// Update Missing Pet Process
router.post(
  "/editPet/:id",
  upload,
  ensureAuthenticated,
  [
    check("name", "Name is required").notEmpty(),
    check("age", "age is required").notEmpty(),
    check("size", "Size is required").notEmpty(),
    check("country", "Country is required").notEmpty(),
    check("city", "City is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
  ],
  function (req, res) {
    var file;
    if (req.body.fileCheck != "" && req.file === undefined) {
      file = path.basename(req.body.fileCheck);
    } else if (req.file === undefined) {
      file = "noImage";
    } else {
      file = req.file.filename;
    }
    const name = req.body.name;
    const species = req.body.species;
    const breed = req.body.breed;
    const gender = req.body.gender;
    const size = req.body.size;
    const age = req.body.age;
    const colors = req.body.colors;
    const locationLastSeen = req.body.locationLastSeen;
    const country = req.body.country;
    const city = req.body.city;
    const currentStatus = req.body.currentStatus;
    const description = req.body.description;
    const file1 = file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("edit_pet", {
        errors: errors.array(),
        user: req.user,
      });
    } else {
      let updatePet = {};
      updatePet.Name = name;
      updatePet.Image = file1;
      updatePet.Species = species;
      updatePet.Age = age;
      updatePet.Breed = breed;
      updatePet.Size = size;
      updatePet.Country = country;
      updatePet.City = city;
      updatePet.Color = colors;
      updatePet.LastLocationSeen = locationLastSeen;
      updatePet.Gender = gender;
      updatePet.CurrentStatus = currentStatus;
      updatePet.Description = description;

      let query = { _id: req.params.id };
      Pet.updateMany(query, updatePet, function (err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Missing Pet Updated");
          res.redirect("/person/edit/missing/" + req.user._id);
        }
      });
    }
  }
);

// Investigate Page Route
router.get("/:id", ensureAuthenticated, function (req, res) {
  Pet.findById(req.params.id, function (err, pet) {
    User.findById(pet.Author, function (err, user1) {
      res.render("investigatePet.pug", {
        pet: pet,
        user1: user1,
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

module.exports = router;
