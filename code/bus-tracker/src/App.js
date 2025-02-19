import React, { useState, useEffect } from 'react';
import DCUMap from './components/DCUMap';
import Header from './components/Header/Header';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TripOverlay from "./components/TripOverlay/TripOverlay"; 

import './App.css';
import Clock from './components/Clock';




function App() {
  const [n4RouteId, setN4RouteId] = useState(null);

  const [geoJsonRoute, setGeoJsonRoute] = useState(null);
  const [busStopMarkers, setBusStopMarkers] = useState(null);
  const [singleStopMarker, setSingleStopMarker]  = useState(null);
  const [showGeoJsonRoute, setShowGeoJsonRoute] = useState(false);
  const [showBusStopMarkers, setShowBusStopMarkers] = useState(false);
  const [showSingleStopMarker, setShowSingleStopMarker] = useState(false);
  
  const [stopTimes, setStopTimes] = useState(null);
  const [stopTimeUpdates, setStopTimeUpdates] = useState(null);
  const [userReports, setUserReports] = useState(null);
  const [showTripOverlay, setShowTripOverlay] = useState(false);

  const busStopIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [1, -30],
  });

  useEffect(() => {
    const fetchRouteId = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/routeid/N4`);
        const data = await response.text();
        console.log(data);
        setN4RouteId(data);
      } catch (error) {
        console.error("Error fetching route id:", error);
      }
    };
    fetchRouteId();
  }, []);

  const checkTrips = async (stop_id, route_id, direction_id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stoptimes/${stop_id}/${route_id}/${direction_id}`);
      const data = await response.json();
      setStopTimes(data.stopTimes);
      setStopTimeUpdates(data.stopTimeUpdates);
      setUserReports(data.userReports);

      console.log(JSON.stringify(data.stopTimes, null, 2));
      console.log(JSON.stringify(data.stopTimeUpdates, null, 2));
      console.log(JSON.stringify(data.userReports, null, 2));
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

  const SecondaryHeader = () => {
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedBottom, setSelectedBottom] = useState(null);
    
    const fetchRoute = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/route/${selectedTop}/${selectedBottom}`);
        const data = await response.json();
        setGeoJsonRoute(data);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    const popupButton = (feature) => {
      checkTrips(feature.stop_id, selectedTop, selectedBottom);
      setShowBusStopMarkers(false);
      setSingleStopMarker(
        <Marker
              position={[feature.stop_lat, feature.stop_lon]}
              icon={busStopIcon}
            >
        </Marker>
      );
      setShowSingleStopMarker(true);
      setShowTripOverlay(true);
    }

    const fetchStops = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stops/${selectedTop}/${selectedBottom}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        setBusStopMarkers(
          data.map((feature, index) => (
            <Marker
              key={index}
              position={[feature.stop_lat, feature.stop_lon]}
              icon={busStopIcon}
            >
              <Popup>
                <b>{feature.stop_name}</b> <br />
                <button
                  className={`popupbutton`}
                  onClick={() => popupButton(feature)}
                >
                  Check Trips
                </button>
              </Popup>
            </Marker>
          ))
        );
      } catch (error) {
        console.error("Error fetching stops:", error);
      }
    };

    const handleTopSelect = (option) => {
      setSelectedTop(selectedTop === option ? null : option);
      setSelectedBottom(null);
    };

    const handleBottomSelect = (option) => {
      setSelectedBottom(selectedBottom === option ? null : option);
      if (selectedTop && selectedBottom !== null) {
        fetchRoute();
        fetchStops();
      }
      setShowGeoJsonRoute(selectedBottom != null ? true : false);
      setShowBusStopMarkers(selectedBottom != null ? true : false);
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
          </DCUMap>
        {showTripOverlay && <TripOverlay 
        stopTimes={stopTimes} 
        stopTimeUpdates={stopTimeUpdates}  
        userReports={userReports} 
        setShowTripOverlay={setShowTripOverlay}
        />}
    </div>
  );
}

export default App;
