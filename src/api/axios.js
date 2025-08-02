import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { refreshToken } from '../utils/tokenRefresh';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1/',
  // Remove default Content-Type to let it be set dynamically
});

// Function to get the appropriate headers based on data type
const getHeaders = (data, isAuthEndpoint = false) => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (data instanceof FormData) {
    // For FormData, don't set Content-Type at all - let browser set it with boundary
    if (isAuthEndpoint || !accessToken) {
      return {}; // No headers for auth endpoints or when no token
    }
    return {
      'Authorization': `Bearer ${accessToken}`,
    };
  }
  
  if (isAuthEndpoint || !accessToken) {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
};

// Track if we're currently refreshing token to prevent multiple requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use(async (req) => {
  let accessToken = localStorage.getItem('accessToken');

  // Check if this is an auth endpoint that shouldn't have Authorization header
  const isAuthEndpoint = req.url?.includes('login') || 
                        req.url?.includes('register') ||
                        req.url?.includes('token/refresh') ||
                        req.url?.includes('reset-password') ||
                        req.url?.includes('set-new-password') ||
                        req.url?.includes('verify-email');

  if (accessToken && !isAuthEndpoint) {
    try {
      // Check if token is valid before decoding
      if (accessToken && accessToken.split('.').length === 3) {
        const decoded = jwtDecode(accessToken);
        const isExpired = dayjs.unix(decoded.exp).diff(dayjs()) < 1000;

        if (isExpired) {
          console.log('Token expired, refreshing...');
          accessToken = await refreshToken();
          if (accessToken) {
            console.log('Token refreshed successfully');
          } else {
            console.log('Token refresh failed');
          }
        }

        if (accessToken) {
          req.headers.Authorization = `Bearer ${accessToken}`;
        }
      } else {
        console.log('Invalid token format, skipping token refresh');
      }
    } catch (error) {
      console.error('Error checking token:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Set appropriate headers based on data type
  const headers = getHeaders(req.data, isAuthEndpoint);
  
  if (req.data instanceof FormData) {
    // For FormData, completely override headers to avoid Content-Type conflicts
    req.headers = headers;
  } else {
    // For JSON data, merge headers
    req.headers = { ...req.headers, ...headers };
  }

  return req;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
        const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if we're already on login page to avoid redirect loops
      const currentPath = window.location.pathname;
      const isOnLoginPage = window.location.pathname === '/login';
      const isOnRegisterPage = window.location.pathname === '/register';
      const isOnForgotPasswordPage = window.location.pathname === '/forgot-password';
      
      // Don't try to refresh token if we're on auth pages OR if this is a login/register request
      const isAuthRequest = originalRequest.url?.includes('login') || 
                          originalRequest.url?.includes('register') ||
                          originalRequest.url?.includes('reset-password') ||
                          originalRequest.url?.includes('set-new-password') ||
                          originalRequest.url?.includes('verify-email');
      
      // Also check if this is a login attempt by looking at the request data
      const isLoginAttempt = originalRequest.data && 
                           (originalRequest.data.includes('email') || 
                            originalRequest.data.includes('password'));
      
      // Check if this is a POST request to auth endpoints (login/register)
      const isAuthPostRequest = originalRequest.method === 'POST' && 
                              (originalRequest.url?.includes('login') || 
                               originalRequest.url?.includes('register'));
      
      // Check if user is actively on login page with form data
      const isOnLoginWithForm = isOnLoginPage && 
                              (document.querySelector('input[name="email"]')?.value || 
                               document.querySelector('input[name="password"]')?.value);
      
      // Check if this is a public page that doesn't require authentication
      const isPublicPage = currentPath.includes('/bikes/') || 
                          currentPath === '/' || 
                          currentPath === '/about' ||
                          currentPath === '/bikes';
      
      if (isOnLoginPage || isOnRegisterPage || isOnForgotPasswordPage || isAuthRequest || isLoginAttempt || isAuthPostRequest || isOnLoginWithForm || isPublicPage) {
        console.log('Skipping token refresh for auth request or public page:', originalRequest.url);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        
        if (newToken) {
          // Process queued requests
          processQueue(null, newToken);
          
          // Retry the original request
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                return api(originalRequest);
        } else {
          // Refresh failed, clear auth data but don't redirect immediately
          console.log('Token refresh failed, clearing auth data');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('role');
          localStorage.removeItem('email');
          localStorage.removeItem('username');
          localStorage.removeItem('is_staff');
          localStorage.removeItem('is_superuser');
          localStorage.removeItem('is_customer');
          localStorage.removeItem('is_verified');
          
          // Only redirect if not on auth pages and not actively logging in
          const isOnAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPath);
          const hasFormData = document.querySelector('input[name="email"]')?.value || 
                             document.querySelector('input[name="password"]')?.value;
          
          // Only redirect if we're on a protected page and not actively logging in
          if (!isOnAuthPage && !hasFormData && !currentPath.includes('/bikes/')) {
            console.log('Redirecting to login due to auth failure');
            window.location.href = '/login?message=session_expired&from=true';
          } else {
            console.log('Skipping redirect - user is on auth page or viewing bikes');
          }
          
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (err) {
        console.error('Refresh token failed:', err);
        processQueue(err, null);
        
        // Clear auth data but don't redirect immediately
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('username');
        localStorage.removeItem('is_staff');
        localStorage.removeItem('is_superuser');
        localStorage.removeItem('is_customer');
        localStorage.removeItem('is_verified');
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;