// Configuration utility for environment variables

export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'https://bike-rental-backend-jmhr.onrender.com/api/v1/',
  
  // App Configuration
  APP_NAME: 'Bike Rental System',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // Validation
  validateConfig() {
    const required = ['API_URL'];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      console.warn('Missing required configuration:', missing);
    }
    
    return missing.length === 0;
  }
};

// Validate configuration on import
config.validateConfig();

export default config; 