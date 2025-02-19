import React, { useState, useEffect } from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './App.css';
import DCUMap from './components/DCUMap';
import Header from './components/Header/Header';
import TripOverlay from "./components/TripOverlay/TripOverlay"; 


function App() {
  const [n4RouteId, setN4RouteId] = useState(null);
  const [showFail, setShowFail] = useState(false);

  const [geoJsonRoute, setGeoJsonRoute] = useState(null);
  const [busStopMarkers, setBusStopMarkers] = useState(null);
  const [singleStopMarker, setSingleStopMarker]  = useState(null);
  const [showGeoJsonRoute, setShowGeoJsonRoute] = useState(false);
  const [showBusStopMarkers, setShowBusStopMarkers] = useState(false);
  const [showSingleStopMarker, setShowSingleStopMarker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [stopTimes, setStopTimes] = useState(null);
  const [stopTimeUpdates, setStopTimeUpdates] = useState(null);
  const [userReports, setUserReports] = useState(null);
  const [vehiclePositions, setVehiclePosition] = useState(null);
  const [showTripOverlay, setShowTripOverlay] = useState(false);

  /* Icon for bus stops */
  const busStopIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [1, -30],
  });

  /* When the app renders, we must fetch the route ids for each of our routes.
     This makes it easier and faster to use our other functions. */
  useEffect(() => {
    const fetchRouteId = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/routeid/N4`);
        const data = await response.text();
        setN4RouteId(data);
      } catch (error) {
        console.error("Error fetching route id:", error);
        setShowFail(true);
      }
    };
    fetchRouteId();
  }, []);

  /* This handles collecting all the data for our trip overlay */
  const checkTrips = async (stop_id, route_id, direction_id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stoptimes/${stop_id}/${route_id}/${direction_id}`);
      const data = await response.json();
      setStopTimes(data.stopTimes);
      setStopTimeUpdates(data.stopTimeUpdates);
      setUserReports(data.userReports);
      setVehiclePosition(data.vehiclePositions);
      console.log(data.vehiclePositions)
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

  /* This is our secondary header which handles the selection of route and direction of route */
  const SecondaryHeader = () => {
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedBottom, setSelectedBottom] = useState(null);
    
    /* This will handle all the functions for setting up the trip overlay */
    const popupButton = (feature) => {
      checkTrips(feature.stop_id, selectedTop, selectedBottom);
      setShowBusStopMarkers(false);
      setSingleStopMarker(  // Make a marker for the selected stop
        <Marker
              position={[feature.stop_lat, feature.stop_lon]}
              icon={busStopIcon}
            >
        </Marker>
      );
      setShowSingleStopMarker(true);
      setShowTripOverlay(true);
    }

    /* Fetch the the GeoJSON data for the selected route */
    const fetchRoute = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/route/${selectedTop}/${selectedBottom}`);
        const data = await response.json();
        setGeoJsonRoute(data);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    /* Fetch the the GeoJSON data for the selected route's stops */
    const fetchStops = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stops/${selectedTop}/${selectedBottom}`);
        const data = await response.json();
        setBusStopMarkers(  // Make markers for all stops
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

    /* Select and unselect the route, direction is unselected is route is changed */
    const handleTopSelect = (option) => {
      setSelectedTop(selectedTop === option ? null : option);
      setSelectedBottom(null);
    };

    /* Select and unselect the direction, once route and direction is chosen, fetch GeoJSON data for all stops
       and the route and display on map */
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
            className={`headerButton ${selectedTop === n4RouteId ? "selected" : ""}`} // Controls what the class name is for css
            onClick={() => handleTopSelect(n4RouteId)}
          >
            N4
          </button>
        </div>

        <div className={`bottomRow ${selectedTop ? "visible" : ""}`}>
          <button
            className={`headerButton ${selectedBottom === "0" ? "selected" : ""}`}
            onClick={() => handleBottomSelect("0")} // direction_id is either 0 or 1
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
        {showTripOverlay && <TripOverlay 
        stopTimes={stopTimes} 
        stopTimeUpdates={stopTimeUpdates}  
        userReports={userReports} 
        vehiclePositions={vehiclePositions}
        setShowTripOverlay={setShowTripOverlay}
        setSelectedVehicle={setSelectedVehicle}
        />}
        {showFail && 
          <div className="error-box">
            <p>Failed to connect to backend, refresh the page</p>
          </div>}
        </div>
  );
}

export default App;
