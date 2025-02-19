import express from 'express';
import cors from 'cors';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDb, closeDb, getShapesAsGeoJSON, getStops, getRoutes, getTrips, getStoptimes, getStopTimeUpdates } from 'gtfs';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "bus-tracker/build");
app.use(express.static(frontendPath));

let db;
let reportsDb;

async function initializeDb() {
  const config = await loadConfig();
  db = openDb(config);
  reportsDb = new sqlite3.Database("user-reports.sqlite");
}

async function loadConfig() {
  const configPath = path.resolve('./config.json');
  const config = JSON.parse(await readFile(configPath, 'utf-8'));
  return config;
}

// Initialize database connection
initializeDb();

// Close database connections on server shutdown
process.on("SIGINT", () => {
  if (db) closeDb(db);
  if (reportsDb) reportsDb.close();
  process.exit();
});

app.get('/api/routeid/:route_short_name', async (req, res) => {
  try {
    const { route_short_name } = req.params;
    const route = await getRoutes({ route_short_name });

    if (!route || route.length === 0) {
      return res.status(404).json({ error: `No route found for ${route_short_name}` });
    }

    res.json({ route_id: route[0].route_id });
  } catch (error) {
    console.error("Error fetching route ID:", error);
    res.status(500).json({ error: "Failed to fetch route ID" });
  }
});

app.get('/api/route/:route_id/:direction_id', async (req, res) => {
  try {
    const { route_id, direction_id } = req.params;
    const shapesGeojson = await getShapesAsGeoJSON({ route_id, direction_id: Number(direction_id) });

    if (!shapesGeojson || !shapesGeojson.features || shapesGeojson.features.length === 0) {
      return res.status(404).json({ error: `No route found for ${route_id}, direction ${direction_id}` });
    }

    res.json(shapesGeojson);
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ error: "Failed to fetch route" });
  }
});

app.get('/api/stops/:route_id/:direction_id', async (req, res) => {
  try {
    const { route_id, direction_id } = req.params;
    const trips = await getTrips({ route_id, direction_id });

    if (!trips || trips.length === 0) {
      return res.status(404).json({ error: `No trips found for ${route_id}, direction ${direction_id}` });
    }

    const stops = await getStops({ trip_id: trips[0].trip_id });

    if (!stops || stops.length === 0) {
      return res.status(404).json({ error: `No stops found for trip_id: ${trips[0].trip_id}` });
    }

    res.json(stops);
  } catch (error) {
    console.error("Error fetching stops:", error);
    res.status(500).json({ error: "Failed to fetch stops" });
  }
});

app.get('/api/stoptimes/:stop_id/:route_id/:direction_id', async (req, res) => {
  try {
    const { stop_id, route_id, direction_id } = req.params;
    const trips = await getTrips({ route_id, direction_id });

    if (!trips || trips.length === 0) {
      return res.status(404).json({ error: `No trips found for ${route_id}, direction ${direction_id}` });
    }

    const now = new Date();
    const formattedDate = Number(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    );
    const formattedTime = new Date(now.getTime() - 30 * 60 * 1000).toTimeString().slice(0, 8); // Subtract 30 minutes

    let stopTimes = [];
    let stopTimeUpdates = [];

    for (const trip of trips) {
      const stopTime = await getStoptimes({ stop_id, trip_id: trip.trip_id, date: formattedDate, start_time: formattedTime });
      if (stopTime.length > 0) stopTimes.push(stopTime[0]);

      const stopTimeUpdate = await getStopTimeUpdates({ stop_id, trip_id: trip.trip_id });
      if (stopTimeUpdate.length > 0) stopTimeUpdates.push(stopTimeUpdate[0]);
    }

    const trip_ids = stopTimes.map(stopTime => stopTime.trip_id);
    const placeholders = trip_ids.map(() => "?").join(", ");
    
    let userReports = [];
    if (trip_ids.length > 0) {
      reportsDb.all(
        `SELECT * FROM reports WHERE trip_id IN (${placeholders}) ORDER BY timestamp DESC`, 
        trip_ids, 
        (err, rows) => {
          if (err) {
            console.error("Error fetching user reports:", err);
            return res.status(500).json({ error: "Failed to fetch user reports" });
          }
          userReports = rows;
          res.json({ stopTimes, stopTimeUpdates, userReports });
        }
      );
    } else {
      res.json({ stopTimes, stopTimeUpdates, userReports });
    }
  } catch (error) {
    console.error("Error fetching stop times:", error);
    res.status(500).json({ error: "Failed to fetch stop times" });
  }
});

app.post("/api/report", async (req, res) => {
  try {
    const { trip_id, stop_id, stop_sequence, status, delayHours, delayMinutes, delaySeconds, description } = req.body;

    reportsDb.run(
      "INSERT INTO reports (trip_id, stop_id, stop_sequence, status, delayHours, delayMinutes, delaySeconds, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [trip_id, stop_id, stop_sequence, status, delayHours, delayMinutes, delaySeconds, description],
      function (err) {
        if (err) {
          console.error("Error submitting report:", err);
          return res.status(500).json({ error: "Failed to submit report" });
        }
        res.status(201).json({ message: "Report added", reportId: this.lastID });
      }
    );
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});