import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

export const fetchStations = async () => {
  try {
    const response = await api.get('/api/stations');
    const data = response.data;
    const stations = Array.isArray(data) ? data : (data?.stations || []);
    if (stations.length > 0) return stations;
    throw new Error('Empty station list received');
  } catch (error) {
    console.error('Failed to fetch stations:', error);
    // Return default fallback station list if API fails
    return DEFAULT_STATIONS;
  }
};

export const DEFAULT_STATIONS = [
  { code: 0, name: 'Amlarem', lat: 25.285278, lng: 92.103056 },
  { code: 1, name: 'Barengapara', lat: 25.201033, lng: 90.310283 },
  { code: 2, name: 'Byrnihat', lat: 26.077500, lng: 91.875556 },
  { code: 3, name: 'Damas_1', lat: 25.938192, lng: 90.727392 },
  { code: 4, name: 'Jowai', lat: 25.436389, lng: 92.193889 },
  { code: 5, name: 'Khliehriat', lat: 25.344722, lng: 92.366111 },
  { code: 6, name: 'Latyrke', lat: 25.343333, lng: 92.458611 },
  { code: 7, name: 'Mairang', lat: 25.558600, lng: 91.625750 },
  { code: 8, name: 'Mawkyrwat_1', lat: 25.371642, lng: 91.481808 },
  { code: 9, name: 'Nongstoin_1', lat: 25.544931, lng: 91.238681 },
  { code: 10, name: 'Panchiring', lat: 25.202250, lng: 91.318917 },
  { code: 11, name: 'Phulbari_1', lat: 25.877194, lng: 90.029719 },
  { code: 12, name: 'Rongjeng_1', lat: 25.610172, lng: 90.731239 },
  { code: 13, name: 'Saiden', lat: 25.884444, lng: 91.882222 },
  { code: 14, name: 'Shillong', lat: 25.582778, lng: 91.886944 },
  { code: 15, name: 'Soksan', lat: 25.898100, lng: 90.642533 },
  { code: 16, name: 'Williamnagar', lat: 25.508500, lng: 90.604389 },
  { code: 17, name: 'Zikzak_1', lat: 25.376111, lng: 89.885556 }
];

export const predictGroundwaterLevel = async (formData) => {
  try {
    const response = await api.post('/api/predict', formData);
    return response.data;
  } catch (error) {
    let errorMsg = 'Failed to connect to backend server. Make sure Spring Boot backend is running on http://localhost:8088';
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'string' && error.response.data.includes('crumb')) {
        errorMsg = 'Port conflict detected. Please restart the backend server on port 8088.';
      } else if (error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.response.data.details) {
        errorMsg = Object.values(error.response.data.details).join(', ');
      }
    } else if (error.message) {
      errorMsg = error.message;
    }
    throw new Error(errorMsg);
  }
};

export default api;
