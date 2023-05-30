const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const config = require("./config/database");
const passport = require("passport");

// Bring in Person Model
let Person = require("./models/person");
let Pet = require("./models/pet");

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;

// Check connection
db.once("open", function () {
  console.log("Connected to MongoDB................");
});

// Check for DB errors
db.on("error", function (err) {
  console.log("The following erros occurred while connecting with MongoDB:");
  console.log(err);
});

// Init App
const app = express();

// Express session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Bring in Models
let Article = require("./models/article");
let User = require("./models/user");

// Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// BodyParser Middleware
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});
// Home Route
app.get("/", ensureAuthenticated, function (req, res) {
  Person.find({}, function (err, person) {
    if (err) {
      console.log("Following Errors occurred in Person.find() function: ");
      console.log(err);
    } else {
      Article.find({}, function (err, articles) {
        res.render("index", {
          articles: articles,
          person: person,
        });
      });
    }
  });
});

// Person.pug;
app.get("/missingPerson", ensureAuthenticated, async function (req, res) {
  try {
    const person = await Person.find();
    const users = await User.find();
    const personAuthor = {};
    users.forEach((user) => (personAuthor[user._id] = user.name));
    console.log(personAuthor);
    res.render("Person", { person, personAuthor });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Person.pug
// app.get("/missingPerson", ensureAuthenticated, function (req, res) {
//   Person.find({}, function (err, person) {
//     if (err) {
//       console.log("Following Errors occurred in Person.find() function: ");
//       console.log(err);
//     } else {
//       Article.find({}, function (err, articles) {
//         res.render("Person", {
//           person: person,
//         });
//       });
//     }
//   });
// });

// pet
app.get("/missingPet", ensureAuthenticated, async function (req, res) {
  try {
    const pet = await Pet.find();
    const users = await User.find();
    const petAuthor = {};
    users.forEach((user) => (petAuthor[user._id] = user.name));
    console.log(petAuthor);
    res.render("Pet", { pet, petAuthor });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
// Pet.pug
// app.get("/missingPet", ensureAuthenticated, function (req, res) {
//   Pet.find({}, function (err, pet) {
//     if (err) {
//       console.log("Following Errors occurred in Person.find() function: ");
//       console.log(err);
//     } else {
//       Article.find({}, function (err, articles) {
//         res.render("Pet", {
//           pet: pet,
//         });
//       });
//     }
//   });
// });

app.get("/article/view", ensureAuthenticated, async function (req, res) {
  try {
    const articles = await Article.find();
    const users = await User.find();
    const articleAuthors = {};
    users.forEach((user) => (articleAuthors[user._id] = user.name));
    console.log(articleAuthors);
    res.render("view_article", { articles, articleAuthors });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route Files
let articles = require("./routes/articles");
let person = require("./routes/person");
let pet = require("./routes/pet");
let users = require("./routes/users");
const user = require("./models/user");
const { log } = require("console");
app.use("/articles", articles);
app.use("/person", person);
app.use("/pet", pet);
app.use("/users", users);

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

// About Route
app.get("/about", ensureAuthenticated, function (req, res) {
  res.render("about", {});
});

// Start Server
app.listen(3000, function () {
  console.log("Server started on port 3000...");
});
