import express from 'express';
import cors from 'cors';
import { readFile } from 'fs/promises';
import path from 'path';
import { openDb, closeDb, getShapesAsGeoJSON, getStops, getRoutes, getTrips, getStoptimes, getStopTimeUpdates, importGtfs } from 'gtfs';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

async function loadConfig() {
  const configPath = path.resolve('./config.json');
  const config = JSON.parse(await readFile(configPath, 'utf-8'));
  return config;
}

/* Get route ID */
app.get('/api/routeid/:route_short_name', async (req, res) => {
  try {
    const { route_short_name } = req.params;
    const config = await loadConfig();
    const db = openDb(config);

    const route = await getRoutes({ route_short_name });

    if (!route || route.length === 0) {
      closeDb(db);
      return res.status(404).json({ error: `No route found for ${route_short_name}` });
    }

    res.json({ route_id: route[0].route_id });
    closeDb(db);
  } catch (error) {
    console.error('Error fetching route ID:', error);
    res.status(500).json({ error: 'Failed to fetch route ID' });
  }
});

/* Get route shape as GeoJSON */
app.get('/api/route/:route_id/:direction_id', async (req, res) => {
  try {
    const { route_id, direction_id } = req.params;
    const config = await loadConfig();
    const db = openDb(config);

    const shapesGeojson = await getShapesAsGeoJSON({ 
      route_id, 
      direction_id: Number(direction_id) 
    });

    if (!shapesGeojson || !shapesGeojson.features || shapesGeojson.features.length === 0) {
      closeDb(db);
      return res.status(404).json({ error: `No route found for ${route_id}, direction ${direction_id}` });
    }

    res.json(shapesGeojson);
    closeDb(db);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

/* Get stops for a route */
app.get('/api/stops/:route_id/:direction_id', async (req, res) => {
  try {
    const { route_id, direction_id } = req.params;
    const config = await loadConfig();
    const db = openDb(config);

    const trips = await getTrips({ route_id, direction_id });

    if (!trips || trips.length === 0) {
      closeDb(db);
      return res.status(404).json({ error: `No trips found for ${route_id}, direction ${direction_id}` });
    }

    const stops = await getStops({ trip_id: trips[0].trip_id });

    if (!stops || stops.length === 0) {
      closeDb(db);
      return res.status(404).json({ error: `No stops found for trip_id: ${trips[0].trip_id}` });
    }

    res.json(stops);
    closeDb(db);
  } catch (error) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

/* Get scheduled stop times and realtime updates */
app.get('/api/stoptimes/:stop_id/:route_id/:direction_id', async (req, res) => {
  try {
    const { stop_id, route_id, direction_id } = req.params;
    const config = await loadConfig();
    const db = openDb(config);

    const trips = await getTrips({ route_id, direction_id });

    if (!trips || trips.length === 0) {
      closeDb(db);
      return res.status(404).json({ error: `No trips found for ${route_id}, direction ${direction_id}` });
    }

    const now = new Date();
    const formattedDate = Number(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    );
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() - 30).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

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
      const reportsDb = new sqlite3.Database("user-reports.sqlite");
      reportsDb.all(
        `SELECT * FROM reports WHERE trip_id IN (${placeholders}) ORDER BY timestamp DESC`, 
        trip_ids, 
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          userReports = rows;
          res.json({ stopTimes, stopTimeUpdates, userReports });
        }
      );
    } else {
      res.json({ stopTimes, stopTimeUpdates, userReports });
    }

    closeDb(db);
  } catch (error) {
    console.error('Error fetching stop times:', error);
    res.status(500).json({ error: 'Failed to fetch stop times' });
  }
});

/* Submit user report */
app.post("/api/report", async (req, res) => {
  try {
    const { trip_id, stop_id, stop_sequence, status, delayHours, delayMinutes, delaySeconds, description } = req.body;
    const reportsDb = new sqlite3.Database("user-reports.sqlite");

    reportsDb.run(
      "INSERT INTO reports (trip_id, stop_id, stop_sequence, status, delayHours, delayMinutes, delaySeconds, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [trip_id, stop_id, stop_sequence, status, delayHours, delayMinutes, delaySeconds, description],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Report added", reportId: this.lastID });
      }
    );
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
