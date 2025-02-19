import sqlite3 from 'sqlite3';
import fs from 'fs'; // Import the file system module to delete the database file

const dbFilePath = "user-reports.sqlite";

// Delete the existing database file if it exists
if (fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath);
    console.log("Existing database deleted.");
}

// Create (or open) the reports database
const db = new sqlite3.Database(dbFilePath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id TEXT NOT NULL,
            stop_id TEXT NOT NULL,
            stop_sequence INT NOT NULL,
            status TEXT NOT NULL,
            delayHours INT NOT NULL,
            delayMinutes INT NOT NULL,
            delaySeconds INT NOT NULL,
            description TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error("Error creating reports table:", err.message);
        else console.log("Reports table created successfully.");
    });
});

db.close();