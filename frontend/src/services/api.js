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
  { code: 0, name: 'Amlarem', lat: 25.285278, lng: 92.103056, observedGwl: 47.27 },
  { code: 1, name: 'Barengapara', lat: 25.201033, lng: 90.310283, observedGwl: 4.46 },
  { code: 2, name: 'Byrnihat', lat: 26.077500, lng: 91.875556, observedGwl: 45.99 },
  { code: 3, name: 'Damas_1', lat: 25.938192, lng: 90.727392, observedGwl: 4.40 },
  { code: 4, name: 'Jowai', lat: 25.436389, lng: 92.193889, observedGwl: 6.61 },
  { code: 5, name: 'Khliehriat', lat: 25.344722, lng: 92.366111, observedGwl: 23.33 },
  { code: 6, name: 'Latyrke', lat: 25.343333, lng: 92.458611, observedGwl: 21.91 },
  { code: 7, name: 'Mairang', lat: 25.558600, lng: 91.625750, observedGwl: -6.07 },
  { code: 8, name: 'Mawkyrwat_1', lat: 25.371642, lng: 91.481808, observedGwl: 6.45 },
  { code: 9, name: 'Nongstoin_1', lat: 25.544931, lng: 91.238681, observedGwl: 3.32 },
  { code: 10, name: 'Panchiring', lat: 25.202250, lng: 91.318917, observedGwl: 3.67 },
  { code: 11, name: 'Phulbari_1', lat: 25.877194, lng: 90.029719, observedGwl: 0.81 },
  { code: 12, name: 'Rongjeng_1', lat: 25.610172, lng: 90.731239, observedGwl: 1.51 },
  { code: 13, name: 'Saiden', lat: 25.884444, lng: 91.882222, observedGwl: 1.99 },
  { code: 14, name: 'Shillong', lat: 25.582778, lng: 91.886944, observedGwl: 2.02 },
  { code: 15, name: 'Soksan', lat: 25.898100, lng: 90.642533, observedGwl: 7.72 },
  { code: 16, name: 'Williamnagar', lat: 25.508500, lng: 90.604389, observedGwl: 5.68 },
  { code: 17, name: 'Zikzak_1', lat: 25.376111, lng: 89.885556, observedGwl: 2.18 }
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
