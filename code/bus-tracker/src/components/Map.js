//import React, { useEffect, useState } from 'react';
//import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
//import L from 'leaflet';
//import DCUMap from './components/DCUMap';
//
//const Map = () => {
//  const [geoData, setGeoData] = useState(null);
//
//    useEffect(() => {
//      fetch('./dublin.geojson')
//        .then((data) => setGeoData(data));
//    }, []);
//
//    L.geoJSON(geojsonFeature).addTo(map);
//    
//  return (
//    <div>
//      <DCUMap />
//    </div>
//  )
//}
//  
//  export default Map;