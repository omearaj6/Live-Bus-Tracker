import axios from 'axios';
import { transit_realtime } from 'gtfs-realtime-bindings';

const API_KEY = process.env.NTA_API_KEY || '1fefda837c6b4a60962b8712d2ad6f3b';
const BUS_POSITION_URL = 'https://api.nationaltransport.ie/gtfsr/v2/Vehicles';

export const fetchLiveBusData = async () => {
  try {
    const response = await axios.get(BUS_POSITION_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'x-api-key': API_KEY,
      },
      responseType: 'arraybuffer',
    });

    const buffer = new Uint8Array(response.data);
    const feed = transit_realtime.FeedMessage.decode(buffer);

    // Extract and filter for specific bus
    const buses = feed.entity
      .map((entity) => ({
        id: entity.id,
        lat: entity.vehicle?.position?.latitude || null,
        lon: entity.vehicle?.position?.longitude || null,
        route: entity.vehicle?.trip?.route_id || 'Unknown',
        timestamp: entity.vehicle?.timestamp
          ? new Date(entity.vehicle.timestamp * 1000).toISOString()
          : 'Unknown',
      }))
      .filter((bus) => bus.id === '4434_1645'); // Filter for the test bus

    console.log('Filtered Bus Data:', buses);
    return buses;
  } catch (error) {
    console.error('Error fetching or decoding bus data:', error.message || error);
    return [];
  }
};

