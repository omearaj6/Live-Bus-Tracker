import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchLiveBusData } from './ntaApi';


const busIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'), 
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const DCUMap = () => {
  const dcuPosition = [53.385846, -6.257644]; 
  const [busPosition, setBusPosition] = useState(null);
  const targetBusId = '4434_1645'; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const busData = await fetchLiveBusData();

        
        const targetBus = busData.find((bus) => bus.id === targetBusId);

        if (targetBus) {
          setBusPosition(targetBus);
        } else {
          console.warn(`Bus with ID ${targetBusId} not found.`);
          setBusPosition(null);
        }
      } catch (error) {
        console.error('Error fetching bus data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); 

    return () => clearInterval(interval);
  }, [targetBusId]);

  return (
    <MapContainer center={dcuPosition} zoom={14} minZoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {busPosition && busPosition.lat && busPosition.lon && (
        <Marker position={[busPosition.lat, busPosition.lon]} icon={busIcon}>
          <Popup>
            <div>
              <strong>Bus ID:</strong> {busPosition.id}
              <br />
              <strong>Route:</strong> {busPosition.route}
              <br />
              <strong>Coordinates:</strong> [{busPosition.lat}, {busPosition.lon}]
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default DCUMap;
