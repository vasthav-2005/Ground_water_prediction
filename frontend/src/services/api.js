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
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stations:', error);
    // Return default fallback station list if API fails
    return [
      { code: 0, name: 'Amlarem' },
      { code: 1, name: 'Barengapara' },
      { code: 2, name: 'Byrnihat' },
      { code: 3, name: 'Damas_1' },
      { code: 4, name: 'Jowai' },
      { code: 5, name: 'Khliehriat' },
      { code: 6, name: 'Latyrke' },
      { code: 7, name: 'Mairang' },
      { code: 8, name: 'Mawkyrwat_1' },
      { code: 9, name: 'Nongstoin_1' },
      { code: 10, name: 'Panchiring' },
      { code: 11, name: 'Phulbari_1' },
      { code: 12, name: 'Rongjeng_1' },
      { code: 13, name: 'Saiden' },
      { code: 14, name: 'Shillong' },
      { code: 15, name: 'Soksan' },
      { code: 16, name: 'Williamnagar' },
      { code: 17, name: 'Zikzak_1' }
    ];
  }
};

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
