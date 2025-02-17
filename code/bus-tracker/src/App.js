import React, { useState, useEffect } from 'react';
import DCUMap from './components/DCUMap';
import Header from './components/Header/Header';
import {GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


import './App.css';




function App() {
  const [n4RouteId, setN4RouteId] = useState(null);

  const [geoJsonRoute, setGeoJsonRoute] = useState(null);
  const [busStopMarkers, setBusStopMarkers] = useState(null);
  const [showGeoJson, setShowGeoJson] = useState(false);

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

  const checkTrips = (stop_id, route_id, direction_id) => {
    console.log(stop_id, route_id, direction_id);
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
                  onClick={() => checkTrips(feature.stop_id, selectedTop, selectedBottom)}
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
      setShowGeoJson(selectedBottom != null ? true : false);
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
  
//  const [showPopup, setShowPopup] = useState(false);
//  const [showBusHereButton, setShowBusHereButton] = useState(false);
//  const [lastActionTime, setLastActionTime] = useState(null);
//  const [selectedBus, setSelectedBus] = useState(null);
//  const [selectedStop, setSelectedStop] = useState(null);
//  const [adjustedReports, setAdjustedReports] = useState({}); 
//  const [timeDifference, setTimeDifference] = useState(null);
//
//  const busStops = {
//    Bus1: [
//      { stop: 'Stop 1A', time: '10:30 AM' },
//      { stop: 'Stop 1B', time: '10:45 AM' },
//      { stop: 'Stop 1C', time: '11:00 AM' },
//    ],
//    Bus2: [
//      { stop: 'Stop 2A', time: '11:15 AM' },
//      { stop: 'Stop 2B', time: '11:30 AM' },
//      { stop: 'Stop 2C', time: '11:45 AM' },
//    ],
//    Bus3: [
//      { stop: 'Stop 3A', time: '12:00 PM' },
//      { stop: 'Stop 3B', time: '12:15 PM' },
//      { stop: 'Stop 3C', time: '12:30 PM' },
//    ],
//  };
//
//  const handlePopupOpen = () => {
//    setShowPopup(true);
//  };
//
//  const handlePopupClose = (answer) => {
//    setShowPopup(false);
//    if (answer === 'yes') {
//      logTime();
//    } else if (answer === 'no') {
//      setShowBusHereButton(true);
//    }
//  };
//
//  const handleBusHereButton = () => {
//    logTime();
//    setShowBusHereButton(false);
//  };
//
//  const logTime = () => {
//    const now = new Date();
//    const actualTime = now.toLocaleTimeString();
//    setLastActionTime(actualTime);
//
//    if (selectedStop) {
//      const scheduledTime = parseTime(selectedStop.time);
//      const delayInMinutes = Math.round((now - scheduledTime) / (1000 * 60));
//
//      const delayHours = Math.floor(Math.abs(delayInMinutes) / 60);
//      const delayMinutes = Math.abs(delayInMinutes) % 60;
//
//      const differenceString =
//        delayInMinutes === 0
//          ? 'On time'
//          : delayInMinutes > 0
//          ? `${delayHours > 0 ? `${delayHours} hour${delayHours > 1 ? 's' : ''} ` : ''}${
//              delayMinutes > 0 ? `${delayMinutes} minute${delayMinutes > 1 ? 's' : ''} ` : ''
//            }late`
//          : `${delayHours > 0 ? `${delayHours} hour${delayHours > 1 ? 's' : ''} ` : ''}${
//              delayMinutes > 0 ? `${delayMinutes} minute${delayMinutes > 1 ? 's' : ''} ` : ''
//            }early`;
//
//      setTimeDifference(differenceString);
//
//      const updatedStops = (adjustedReports[selectedBus] || busStops[selectedBus]).map((stop, index) => {
//        const stopTime = parseTime(stop.time);
//        if (busStops[selectedBus].indexOf(selectedStop) <= index) {
//          let newTime = new Date(stopTime.getTime() + delayInMinutes * 60 * 1000);
//          stop.adjustedTime = newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//        }
//        return stop;
//      });
//
//      setAdjustedReports((prev) => ({
//        ...prev,
//        [selectedBus]: updatedStops,
//      }));
//    }
//  };
//
//  const parseTime = (timeString) => {
//    const [hours, minutes, meridian] = timeString.split(/[: ]/);
//    const date = new Date();
//    date.setHours(
//      meridian === 'PM' && parseInt(hours) !== 12
//        ? parseInt(hours) + 12
//        : parseInt(hours)
//    );
//    date.setMinutes(parseInt(minutes));
//    date.setSeconds(0);
//    return date;
//  };
//
//  const handleBusClick = (bus) => {
//    setSelectedBus(bus);
//    setTimeDifference(null);
//  };
//
//  const handleStopClick = (stop) => {
//    setSelectedStop(stop);
//  };
//
//  const handleBackToStopList = () => {
//    setSelectedStop(null);
//    setShowBusHereButton(false);
//  };
//
//  const handleBackToBusList = () => {
//    setSelectedBus(null);
//    setSelectedStop(null);
//    setShowBusHereButton(false);
//    setTimeDifference(null);
//  };

  return (
    <div>
        <Header />
        <SecondaryHeader />
          <DCUMap>
            <Marker position={[53.385846, -6.257644]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
            {showGeoJson && busStopMarkers}
            {showGeoJson && geoJsonRoute && <GeoJSON data={geoJsonRoute} />}
          </DCUMap>  
    </div>
  );
}

export default App;

//const DCUMap = ({ children }) => {
//  const dcuPosition = [53.385846, -6.257644];
//  const [geoJsonData, setGeoJsonData] = useState(null);
//
//  useEffect(() => {
//    const fetchTrips = async () => {
//      try {
//        const response = await fetch('http://localhost:5000/api/trips');
//        const data = await response.json();
//        setGeoJsonData(data);
//      } catch (error) {
//        console.error("Error fetching trips:", error);
//      }
//    };
//    fetchTrips();
//  }, []);
//
//  return (
//    <div style={{ width: '100vw', height: 'calc(100vh - 9.3em)' }}>
//      <MapContainer center={dcuPosition} zoom={12} minZoom={12} style={{height: '100%', width: '100%'}}>
//        <TileLayer
//          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//          attribution="&copy; OpenStreetMap contributors"
//        />
//
//        {geoJsonData && <GeoJSON data={geoJsonData} />}
//        {children}
//      </MapContainer>
//    </div>
//  );
//};
//
//export default DCUMap;