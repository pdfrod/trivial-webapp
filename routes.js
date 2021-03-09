var db = require("./database.js");
var express = require("express");
var router = express.Router();

// Home page
router.get("/", function (req, res, next) {
  var query = `
    SELECT
      stories.id AS storyId,
      title,
      description,
      username,
      count(upvotes.story_id) AS upvotes
    FROM stories JOIN users ON stories.user_id = users.id
    LEFT JOIN upvotes ON upvotes.story_id = stories.id
    GROUP BY stories.id, title, description, username
    ORDER BY stories.id DESC
  `;
  var stories = db.prepare(query).all();
  var user = res.locals.currentUser;
  var upvoted = {};

  if (user) {
    query = `SELECT story_id as storyId FROM upvotes WHERE user_id = ${user.id}`;
    for (var row of db.prepare(query).all()) {
      upvoted[row.storyId] = true;
    }
  }

  for (var story of stories) {
    story.canUpvote = user && !upvoted[story.storyId];
  }

  res.render("index", { stories: stories, upvoted: upvoted });
});

// Login form
router.get("/login", function (req, res, next) {
  res.render("login");
});

// Submit login form
router.post("/login", function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var query = `SELECT id FROM users WHERE username = '${username}' AND password = '${password}'`;
  var user = db.prepare(query).get();

  if (user) {
    signIn(res, user.id);
    res.redirect("/");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

// Signup form
router.get("/signup", function (req, res, next) {
  res.render("signup");
});

// Submit signup form
router.post("/signup", function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var query = `SELECT true FROM users WHERE username = '${username}'`;

  if (db.prepare(query).get()) {
    res.render("signup", {
      error: `A user with username ${username} already exists`,
    });
  } else if (username && password) {
    query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
    db.prepare(query).run();
    signIn(
      res,
      db.prepare(`SELECT id FROM users WHERE username = '${username}'`).get().id
    );
    res.redirect("/");
  } else {
    res.render("signup", {
      error: `Please fill all fields`,
    });
  }
});

// Story submit form
router.get("/submit", function (req, res, next) {
  res.render("submit");
});

// Submit story
router.post("/submit", function (req, res, next) {
  var title = req.body.title;
  var description = req.body.description;
  var userId = res.locals.currentUser.id;

  if (title && description) {
    query = `INSERT INTO stories (user_id, title, description) VALUES (${userId}, '${title}', '${description}')`;
    db.prepare(query).run();
    res.redirect("/");
  } else {
    res.render("submit", {
      error: `Please fill all fields`,
    });
  }
});

// Upvote
router.get("/upvote", function (req, res, next) {
  var storyId = req.query.id;
  var userId = res.locals.currentUser.id;
  var query = `INSERT INTO upvotes (story_id, user_id) VALUES (${storyId}, ${userId})`;

  db.prepare(query).run();
  res.redirect("/");
});

// Logout
router.get("/logout", function (req, res, next) {
  res.cookie("currentUserId", "", { maxAge: 0 });
  res.redirect("/");
});

function signIn(res, id) {
  var maxAge = 30 * 24 * 60 * 60 * 1000; // 1 month
  res.cookie("currentUserId", id, { maxAge: maxAge });
}

module.exports = router;
