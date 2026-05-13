const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'favorites.db');
const db = new sqlite3.Database(dbPath);

const createFavoritesTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      anime_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT,
      score REAL,
      episodes INTEGER,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, anime_id)
    )
  `);
};

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if favorites table exists and has user_id column
  db.all("PRAGMA table_info(favorites)", (err, rows) => {
    if (!err && rows && rows.length > 0) {
      const hasUserId = rows.some(row => row.name === 'user_id');
      if (!hasUserId) {
        console.log("Automatic Migration: Dropping legacy favorites table to apply multi-user schema...");
        db.run("DROP TABLE IF EXISTS favorites", () => {
          createFavoritesTable();
        });
      } else {
        createFavoritesTable();
      }
    } else {
      createFavoritesTable();
    }
  });
});

module.exports = db;
