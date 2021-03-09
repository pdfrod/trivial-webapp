var db = require("./database.js");

module.exports = function (req, res, next) {
  var id = req.cookies.currentUserId;
  id = parseInt(id, 10);
  if (id) {
    res.locals.currentUser = db
      .prepare(`SELECT * FROM users WHERE id = ${id}`)
      .get();
  }
  next();
};
