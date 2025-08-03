import axios from 'axios';
import config from './config.js';

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    console.log('No refresh token found');
    return null;
  }

  try {
    console.log('Attempting to refresh token...');
    // Use the same URL as the main axios instance
    const response = await axios.post(`${config.API_URL}token/refresh/`, { refresh });
    console.log('Token refresh successful');
    localStorage.setItem('accessToken', response.data.access);
    return response.data.access;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Don't redirect here - let the calling code handle it
    return null;
  }
}; 