import axios from 'axios';

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    console.log('No refresh token found');
    return null;
  }

  try {
    console.log('Attempting to refresh token...');
    // Use the same production URL as the main axios instance
    const response = await axios.post('https://bike-rental-backend-jmhr.onrender.com/api/v1/token/refresh/', { refresh });
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