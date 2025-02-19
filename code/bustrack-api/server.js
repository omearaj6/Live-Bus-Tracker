import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { openDb, closeDb, getShapesAsGeoJSON, getStops, getRoutes, getTrips, getStoptimes, getStopTimeUpdates, importGtfs } from 'gtfs';
import sqlite3 from 'sqlite3';


const config = JSON.parse(
  await readFile(path.join(import.meta.dirname, 'config.json'))
);

await importGtfs(config);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow React frontend to access API

async function loadConfig() {
  const configPath = path.resolve('./config.json');
  const config = JSON.parse(await readFile(configPath, 'utf-8'));
  return config;
}

app.get('/api/routeid/:route_short_name', async (req, res) => {
  try {
    const { route_short_name } = req.params; // Correct destructuring
    const config = await loadConfig();
    const db = openDb(config);

    const route = getRoutes({  // Ensure await if needed
      route_short_name: route_short_name
    });

    res.send(route[0].route_id);
    closeDb(db); // Close DB after sending response
    console.log("Sent route id");
    //console.log(JSON.stringify(shapesGeojson, null, 2));
  } catch (error) {
    console.error('Error fetching route id:', error);
    res.status(500).json({ error: 'Failed to fetch route id' });
  }
});

app.get('/api/route/:route_id/:direction_id', async (req, res) => {
  try {
    const { route_id, direction_id } = req.params; // Correct destructuring
    const config = await loadConfig();
    const db = openDb(config);

    const shapesGeojson = getShapesAsGeoJSON({  // Ensure await if needed
      route_id: route_id,
      direction_id: Number(direction_id)
    });

    res.json(shapesGeojson);
    closeDb(db); // Close DB after sending response
    console.log("Sent route");
    //console.log(JSON.stringify(shapesGeojson, null, 2));
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

app.get('/api/stops/:route_id/:direction_id', async (req, res) => {
  try {
    const { route_id, direction_id } = req.params;
    const config = await loadConfig();
    const db = openDb(config);

    const trips = getTrips({
      route_id: route_id,
      direction_id: direction_id
    })
    
    const shapesGeoJson = getStops({ trip_id: trips[0].trip_id });
    
    res.json(shapesGeoJson);
    closeDb(db);
    console.log("sent stops")
  } catch (error) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

app.get('/api/stoptimes/:stop_id/:route_id/:direction_id', async (req, res) => {
  try {
    const { stop_id, route_id, direction_id } = req.params;
    const config = await loadConfig();
    const db = openDb(config);

    const trips = getTrips({
      route_id: route_id,
      direction_id: direction_id
    });

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = Number(`${year}${month}${day}`);

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes() - 30).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    let stopTimes = [];
    let stopTimeUpdates = [];
    for (let i = 0; i < trips.length; i++) {
      let stopTime = getStoptimes({
        stop_id: stop_id,
        trip_id: trips[i].trip_id,
        date: formattedDate,
        start_time: formattedTime,
      });
      
      if (stopTime.length > 0) {
        stopTimes.push(stopTime[0]);
      }

      let stopTimeUpdate = getStopTimeUpdates({
        stop_id: stop_id,
        trip_id: trips[i].trip_id,
      });

      if (stopTimeUpdate.length > 0) {
        stopTimeUpdates.push(stopTimeUpdate[0]);
      }
    }

    const trip_ids = stopTimes.map(stopTime => stopTime.trip_id);
    const placeholders = trip_ids.map(() => "?").join(", ");
    let userReports = [];
    const reportsDb = new sqlite3.Database("user-reports.sqlite");
    reportsDb.all(`SELECT * FROM reports WHERE trip_id IN (${placeholders}) ORDER BY timestamp DESC`, trip_ids, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      userReports = rows;
      res.json({ stopTimes, stopTimeUpdates, userReports });
    });

    closeDb(db);
    console.log("sent stop times")
  } catch (error) {
    console.error('Error fetching stop times:', error);
    res.status(500).json({ error: 'Failed to fetch stop times' });
  }
});

app.post("/api/report", express.json(), (req, res) => {
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
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
