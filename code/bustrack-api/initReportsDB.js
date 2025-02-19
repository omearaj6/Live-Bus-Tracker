import sqlite3 from 'sqlite3';
// Create (or open) the reports database
const db = new sqlite3.Database("user-reports.sqlite");

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
