const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'users.db'));
        this.init();
    }

    init() {
        // Create users table if it doesn't exist
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating users table:', err);
            } else {
                console.log('✅ Database initialized successfully');
            }
        });
    }

    // Add a verified user to the database
    addUser(discordId, username) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO users (discord_id, username, verified_at, last_seen) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                [discordId, username],
                function(err) {
                    if (err) {
                        console.error('❌ Error adding user to database:', err);
                        reject(err);
                    } else {
                        console.log(`✅ Added user ${username} (${discordId}) to database`);
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    // Check if user is already verified
    isUserVerified(discordId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE discord_id = ?',
                [discordId],
                (err, row) => {
                    if (err) {
                        console.error('❌ Error checking user verification:', err);
                        reject(err);
                    } else {
                        resolve(!!row);
                    }
                }
            );
        });
    }

    // Get all verified users
    getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM users ORDER BY verified_at DESC',
                (err, rows) => {
                    if (err) {
                        console.error('❌ Error getting all users:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // Update last seen timestamp
    updateLastSeen(discordId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE discord_id = ?',
                [discordId],
                function(err) {
                    if (err) {
                        console.error('❌ Error updating last seen:', err);
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }

    // Close database connection
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err);
            } else {
                console.log('✅ Database connection closed');
            }
        });
    }
}

module.exports = Database;
