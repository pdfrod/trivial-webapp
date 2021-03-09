var sqlite = require("better-sqlite3");

function createDatabase() {
  var db = sqlite("db.sqlite");

  if (!isInitialized(db)) {
    createSchema(db);
    insertDummyData(db);
  }

  return db;
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      story_id INTEGER,
      user_id INTEGER
    );
  `);
}

function insertDummyData(db) {
  db.exec(`
    INSERT INTO users (id, username, password)
    VALUES (1, 'jimi', 'a'), (2, 'steve', 'a');

    INSERT INTO stories (id, user_id, title, description)
    VALUES
      (1, 1, 'Great story bro', 'Assure polite his really and others figure though. Day age advantages end sufficient eat expression travelling.'),
      (2, 2, 'Bitcoin hits 1M', 'Seen you eyes son show. Far two unaffected one alteration apartments celebrated but middletons interested.');

    INSERT INTO upvotes (user_id, story_id) VALUES (1, 2);
  `);
}

function isInitialized(db) {
  var query =
    "SELECT true FROM sqlite_master WHERE type='table' AND name='users'";
  return db.prepare(query).get();
}

module.exports = createDatabase();
