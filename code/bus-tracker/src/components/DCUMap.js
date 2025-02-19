import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


const DCUMap = ({ children, showTripOverlay }) => {
  const dcuPosition = [53.385846, -6.257644];

  return (
    /* Height changes to if trip overlay is being displayed.
       Height and width is always size of screen with some space to accomadate headers. 
       Center is always at DCU at the moment as this is where our routes are. */
    <div style={{ width: '100vw', height: showTripOverlay ? 'calc(65vh - 9.3em)' : 'calc(100vh - 9.3em)' }}>
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
