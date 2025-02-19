import React, { useState, useEffect } from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './App.css';
import DCUMap from './components/DCUMap';
import Header from './components/Header/Header';
import TripOverlay from "./components/TripOverlay/TripOverlay"; 

const API_BASE_URL = "http://localhost:5000"; // Update to match your backend URL

function App() {
  const [n4RouteId, setN4RouteId] = useState(null);
  const [showFail, setShowFail] = useState(false);

  const [geoJsonRoute, setGeoJsonRoute] = useState(null);
  const [busStopMarkers, setBusStopMarkers] = useState(null);
  const [singleStopMarker, setSingleStopMarker] = useState(null);
  const [showGeoJsonRoute, setShowGeoJsonRoute] = useState(false);
  const [showBusStopMarkers, setShowBusStopMarkers] = useState(false);
  const [showSingleStopMarker, setShowSingleStopMarker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [stopTimes, setStopTimes] = useState(null);
  const [stopTimeUpdates, setStopTimeUpdates] = useState(null);
  const [userReports, setUserReports] = useState(null);
  const [vehiclePositions, setVehiclePositions] = useState(null);
  const [showTripOverlay, setShowTripOverlay] = useState(false);

  /* Icon for bus stops */
  const busStopIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [1, -30],
  });

  /* Fetch the N4 route ID when the app starts */
  useEffect(() => {
    const fetchRouteId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/routeid/N4`);
        if (!response.ok) throw new Error("Failed to fetch route ID");
        const data = await response.json();
        setN4RouteId(data.route_id);
      } catch (error) {
        console.error("Error fetching route ID:", error);
        setShowFail(true);
      }
    };
    fetchRouteId();
  }, []);

  /* Fetch stop times, updates, and user reports */
  const checkTrips = async (stop_id, route_id, direction_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stoptimes/${stop_id}/${route_id}/${direction_id}`);
      if (!response.ok) throw new Error("Failed to fetch stop times");
      const data = await response.json();
      setStopTimes(data.stopTimes);
      setStopTimeUpdates(data.stopTimeUpdates);
      setUserReports(data.userReports);
      setVehiclePositions(data.vehiclePositions);
      console.log("Vehicle positions:", data.vehiclePositions); // Debugging
    } catch (error) {
      console.error("Error fetching stop times:", error);
    }
  };

  /* Secondary header component for route and direction selection */
  const SecondaryHeader = () => {
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedBottom, setSelectedBottom] = useState(null);
    
    /* Handle stop selection for trip overlay */
    const popupButton = (feature) => {
      if (!selectedBottom) {
        console.error("Direction ID is null. Please select a direction first.");
        return;
      }
      checkTrips(feature.stop_id, selectedTop, selectedBottom);
      setShowBusStopMarkers(false);
      setSingleStopMarker(
        <Marker position={[feature.stop_lat, feature.stop_lon]} icon={busStopIcon} />
      );
      setShowSingleStopMarker(true);
      setShowTripOverlay(true);
    };

    /* Fetch the GeoJSON data for the selected route */
    const fetchRoute = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/route/${selectedTop}/${selectedBottom}`);
        if (!response.ok) throw new Error("Failed to fetch route");
        const data = await response.json();
        setGeoJsonRoute(data);
        setShowGeoJsonRoute(true);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    /* Fetch the GeoJSON data for the selected route's stops */
    const fetchStops = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stops/${selectedTop}/${selectedBottom}`);
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

    /* Handle route selection */
    const handleTopSelect = (option) => {
      setSelectedTop(selectedTop === option ? null : option);
      setSelectedBottom(null);
    };

    /* Handle direction selection */
    const handleBottomSelect = (option) => {
      setSelectedBottom(selectedBottom === option ? null : option);
      if (selectedTop && selectedBottom !== null) {
        fetchRoute();
        fetchStops();
      }
      setShowGeoJsonRoute(selectedBottom !== null);
      setShowBusStopMarkers(selectedBottom !== null);
    };

    return (
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
    );
  };

  return (
    <div className="relative w-full h-screen">
      <Header />
      <SecondaryHeader />
      <DCUMap showTripOverlay={showTripOverlay}>
        {showBusStopMarkers && busStopMarkers}
        {showGeoJsonRoute && geoJsonRoute && <GeoJSON data={geoJsonRoute} />}
        {showSingleStopMarker && singleStopMarker}
        {selectedVehicle}
      </DCUMap>
      {showTripOverlay && (
        <TripOverlay
          stopTimes={stopTimes}
          stopTimeUpdates={stopTimeUpdates}
          userReports={userReports}
          vehiclePositions={vehiclePositions}
          setShowTripOverlay={setShowTripOverlay}
          setSelectedVehicle={setSelectedVehicle}
        />
      )}
      {showFail && (
        <div className="error-box">
          <p>Failed to connect to backend. Please refresh the page.</p>
        </div>
      )}
    </div>
  );
}

export default App;