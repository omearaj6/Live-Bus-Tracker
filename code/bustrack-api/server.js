import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { openDb, getShapesAsGeoJSON, getStopsAsGeoJSON, getStops, getRoutes, getTrips, closeDb } from 'gtfs';

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
