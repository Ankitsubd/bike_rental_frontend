// Centralized error handling utility

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  // Extract error message from different error formats
  let message = defaultMessage;
  
  if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.detail) {
    message = error.response.data.detail;
  } else if (error.message) {
    message = error.message;
  }
  
  // Log error for debugging (remove in production)
  console.error('API Error:', {
    message,
    status: error.response?.status,
    url: error.config?.url,
    data: error.response?.data
  });
  
  return message;
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isAuthError = (error) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

export const isServerError = (error) => {
  return error.response?.status >= 500;
};

export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }
  
  if (isAuthError(error)) {
    return 'Authentication failed. Please log in again.';
  }
  
  if (isServerError(error)) {
    return 'Server error. Please try again later.';
  }
  
  return handleApiError(error);
}; 