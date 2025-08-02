import axios from 'axios';

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    console.log('No refresh token found');
    return null;
  }

  try {
    console.log('Attempting to refresh token...');
    const response = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', { refresh });
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