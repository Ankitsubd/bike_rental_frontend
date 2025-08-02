import api from './axios';
import { jwtDecode } from 'jwt-decode';

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;

  // Handle specific error cases
  if (status === 400) {
    if (data?.email) {
      return `Email: ${data.email[0]}`;
    }
    if (data?.password) {
      return `Password: ${data.password[0]}`;
    }
    if (data?.full_name) {
      return `Full Name: ${data.full_name[0]}`;
    }
    if (data?.phone_number) {
      return `Phone Number: ${data.phone_number[0]}`;
    }
    if (data?.non_field_errors) {
      // Handle authentication errors specifically
      const errorMessage = data.non_field_errors[0];
      if (errorMessage.toLowerCase().includes('password') || 
          errorMessage.toLowerCase().includes('credentials') ||
          errorMessage.toLowerCase().includes('invalid')) {
        return 'Password Incorrect. Please try again.';
      }
      return errorMessage;
    }
    if (data?.detail) {
      return data.detail;
    }
    return 'Please check your input and try again.';
  }

  if (status === 401) {
    return 'Password Incorrect. Please try again.';
  }

  if (status === 403) {
    return 'Access denied. Please check your permissions.';
  }

  if (status === 404) {
    return 'The requested resource was not found.';
  }

  if (status === 422) {
    if (data?.password) {
      return `Password: ${data.password[0]}`;
    }
    if (data?.old_password) {
      return 'Old password wrong please input current password.';
    }
    if (data?.detail) {
      return data.detail;
    }
    return 'Please check your input and try again.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status === 500) {
    // Check if it's a server error with HTML response (Django debug page)
    if (data && typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
      return 'Server error. Please try again in a few moments.';
    }
    return 'Server error. Please try again in a few moments.';
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'Service temporarily unavailable. Please try again later.';
  }

  // Network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    return 'Connection error. Please check your internet connection.';
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('username');
  localStorage.removeItem('full_name');
  localStorage.removeItem('phone_number');
  localStorage.removeItem('is_staff');
  localStorage.removeItem('is_superuser');
  localStorage.removeItem('is_verified');
};

// Login user
export const loginAPI = async ({ email, password }) => {
  try {
    // Clear any existing tokens before login
    clearAuthData();
    
    const res = await api.post('login/', { email, password });
    
    const { access, refresh, is_staff, is_superuser, username, is_verified, full_name, phone_number } = res.data;

    if (!access || !refresh) {
      throw new Error("Incomplete response from server");
    }

    // Store tokens and metadata
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('role', (is_staff || is_superuser) ? 'admin' : 'customer');
    localStorage.setItem('email', email);
    localStorage.setItem('username', username);
    localStorage.setItem('full_name', full_name || '');
    localStorage.setItem('phone_number', phone_number || '');
    localStorage.setItem('is_staff', is_staff);
    localStorage.setItem('is_superuser', is_superuser);
    localStorage.setItem('is_verified', is_verified);

    // Return decoded token to AuthContext
    const decoded = jwtDecode(access);
    return {
      ...decoded,
      is_staff,
      is_superuser,
      is_verified,
      username,
      email
    };
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Register with email, password, full_name, and phone_number
export const register = async (data) => {
  try {
    const { email, password, full_name, phone_number } = data;
    console.log('Sending registration data:', { email, password, full_name, phone_number });
    const res = await api.post('register/', { email, password, full_name, phone_number });
    return res;
  } catch (err) {
    console.error("Registration failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Email verification
export const verifyEmail = async (uid, token) => {
  try {
    const res = await api.get(`verify-email/${uid}/${token}/`);
    return res;
  } catch (err) {
    console.error("Email verification failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const res = await api.post('reset-password/', { email });
    return res;
  } catch (err) {
    console.error("Password reset request failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Reset password with token
export const resetPassword = async (token, data) => {
  try {
    const res = await api.patch(`set-new-password/${token}/`, data, {
      headers: { Authorization: '' },
    });
    return res;
  } catch (err) {
    console.error("Password reset failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Change password (authenticated)
export const changePassword = async (data) => {
  try {
    const res = await api.put('change-password/', data);
    return res;
  } catch (err) {
    console.error("Password change failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Logout user
export const logout = () => {
  clearAuthData();
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const res = await api.get('user/profile/');
    return res.data;
  } catch (err) {
    console.error("Get profile failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};

// Update user profile
export const updateUserProfile = async (data) => {
  try {
    const res = await api.put('user/update-profile/', data);
    return res.data;
  } catch (err) {
    console.error("Update profile failed:", err.response?.data || err.message);
    const userFriendlyError = getErrorMessage(err);
    throw new Error(userFriendlyError);
  }
};
