import React from 'react';
import { MapContainer, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';




const DCUMap = ({ children }) => {
  const dcuPosition = [53.385846, -6.257644];

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 9.3em)' }}>
      <MapContainer center={dcuPosition} zoom={12} minZoom={12} style={{height: '100%', width: '100%'}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {children}
      </MapContainer>
    </div>
  );
};

export default DCUMap;


  //const busStops = filteredFeatures.filter((feature) => feature.geometry?.type === "Point");
  //
  //// Generate Markers for Bus Stops
  //const busStopMarkers = busStops.map((feature, index) => (
  //  <Marker
  //    key={index}
  //    position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
  //    icon={busStopIcon}
  //  >
  //    <Popup>
  //      <b>{feature.properties.stop_name}</b> <br />
  //      Routes: {feature.properties.routes?.map((route) => route.route_short_name).join(", ")}
  //    </Popup>
  //  </Marker>
  //));