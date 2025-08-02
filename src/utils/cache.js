// Simple caching utility for API responses
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Set a value in cache with optional TTL
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  // Get a value from cache
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  // Check if a key exists and is not expired
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size() {
    this.cleanup();
    return this.cache.size;
  }
}

// Create a global cache instance
const apiCache = new SimpleCache();

// Cache keys for different API endpoints
export const CACHE_KEYS = {
  BIKES: 'bikes',
  BIKE_DETAIL: (id) => `bike_${id}`,
  USER_PROFILE: 'user_profile',
  USER_BOOKINGS: 'user_bookings',
  USER_STATS: 'user_stats',
  ADMIN_STATS: 'admin_stats',
  ADMIN_USERS: 'admin_users',
  REVIEWS: (bikeId) => `reviews_${bikeId}`,
};

export default apiCache; 