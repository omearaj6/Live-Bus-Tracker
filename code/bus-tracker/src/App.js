import React, { useState, useEffect } from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './App.css';
import DCUMap from './components/DCUMap';
import Header from './components/Header/Header';
import TripOverlay from "./components/TripOverlay/TripOverlay"; 

const API_BASE_URL = "https://live-bus-tracker.onrender.com"; 

function App() {
  const [n4RouteId, setN4RouteId] = useState(null);
  const [geoJsonRoute, setGeoJsonRoute] = useState(null);
  const [busStopMarkers, setBusStopMarkers] = useState(null);
  const [singleStopMarker, setSingleStopMarker] = useState(null);
  const [showGeoJsonRoute, setShowGeoJsonRoute] = useState(false);
  const [showBusStopMarkers, setShowBusStopMarkers] = useState(false);
  const [showSingleStopMarker, setShowSingleStopMarker] = useState(false);
  const [stopTimes, setStopTimes] = useState(null);
  const [stopTimeUpdates, setStopTimeUpdates] = useState(null);
  const [userReports, setUserReports] = useState(null);
  const [showTripOverlay, setShowTripOverlay] = useState(false);
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);

  /* Icon for bus stops */
  const busStopIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [1, -30],
  });

  /* Fetch N4 Route ID on app start */
  useEffect(() => {
    const fetchRouteId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/routeid/N4`);
        if (!response.ok) throw new Error("Failed to fetch route ID");
        const data = await response.json();
        setN4RouteId(data.route_id);
      } catch (error) {
        console.error("Error fetching route ID:", error);
      }
    };
    fetchRouteId();
  }, []);

  /* Fetch stop times, updates, and user reports */
  const checkTrips = async (stop_id, route_id, direction_id) => {
    try {
      const url = `${API_BASE_URL}/api/stoptimes/${stop_id}/${route_id}/${direction_id}`;
      console.log("Fetching stop times from:", url); // Debugging
  
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Failed to fetch stop times. Status:", response.status); // Debugging
        throw new Error("Failed to fetch stop times");
      }
  
      const data = await response.json();
      console.log("Stop times data:", data); // Debugging
  
      setStopTimes(data.stopTimes);
      setStopTimeUpdates(data.stopTimeUpdates);
      setUserReports(data.userReports);
    } catch (error) {
      console.error("Error fetching stop times:", error);
    }
  };
  

  /* Handles fetching route data */
  const fetchRoute = async (route_id, direction_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/route/${route_id}/${direction_id}`);
      if (!response.ok) throw new Error("Failed to fetch route");
      const data = await response.json();
      setGeoJsonRoute(data);
      setShowGeoJsonRoute(true);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  /* Handles fetching stop data */
  const fetchStops = async (route_id, direction_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stops/${route_id}/${direction_id}`);
      if (!response.ok) throw new Error("Failed to fetch stops");
      const data = await response.json();
      setBusStopMarkers(
        data.map((feature, index) => (
          <Marker key={index} position={[feature.stop_lat, feature.stop_lon]} icon={busStopIcon}>
            <Popup>
              <b>{feature.stop_name}</b> <br />
              <button className="popupbutton" onClick={() => popupButton(feature)}>
                Check Trips
              </button>
            </Popup>
          </Marker>
        ))
      );
      setShowBusStopMarkers(true);
    } catch (error) {
      console.error("Error fetching stops:", error);
    }
  };

  /* Handles stop selection for trip overlay */
  const popupButton = (feature) => {
    checkTrips(feature.stop_id, selectedTop, selectedBottom);
    setShowBusStopMarkers(false);
    setSingleStopMarker(
      <Marker position={[feature.stop_lat, feature.stop_lon]} icon={busStopIcon} />
    );
    setShowSingleStopMarker(true);
    setShowTripOverlay(true);
  };

  /* Handles route selection */
  const handleTopSelect = (option) => {
    if (selectedTop === option) {
      setSelectedTop(null);
      setSelectedBottom(null);
      setGeoJsonRoute(null);
      setBusStopMarkers(null);
      setShowGeoJsonRoute(false);
      setShowBusStopMarkers(false);
    } else {
      setSelectedTop(option);
      setSelectedBottom(null);
    }
  };

  /* Handles direction selection */
  const handleBottomSelect = (option) => {
    if (selectedBottom === option) {
      setSelectedBottom(null);
      setGeoJsonRoute(null);
      setBusStopMarkers(null);
      setShowGeoJsonRoute(false);
      setShowBusStopMarkers(false);
    } else {
      setSelectedBottom(option);
      fetchRoute(selectedTop, option);
      fetchStops(selectedTop, option);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Header />
      <div className="secondaryHeader">
        <div className="topRow">
          <button
            className={`headerButton ${selectedTop === n4RouteId ? "selected" : ""}`}
            onClick={() => handleTopSelect(n4RouteId)}
          >
            N4
          </button>
        </div>
        <div className={`bottomRow ${selectedTop ? "visible" : ""}`}>
          <button
            className={`headerButton ${selectedBottom === "0" ? "selected" : ""}`}
            onClick={() => handleBottomSelect("0")}
          >
            Blanchardstown
          </button>
          <button
            className={`headerButton ${selectedBottom === "1" ? "selected" : ""}`}
            onClick={() => handleBottomSelect("1")}
          >
            Point Village
          </button>
        </div>
      </div>
      <DCUMap showTripOverlay={showTripOverlay}>
        {showBusStopMarkers && busStopMarkers}
        {showGeoJsonRoute && geoJsonRoute && <GeoJSON data={geoJsonRoute} />}
        {showSingleStopMarker && singleStopMarker}
      </DCUMap>
      {showTripOverlay && (
        <TripOverlay
          stopTimes={stopTimes}
          stopTimeUpdates={stopTimeUpdates}
          userReports={userReports}
          setShowTripOverlay={setShowTripOverlay}
        />
      )}
    </div>
  );
}

export default App;