// Utility function to get the correct image URL
export const getImageUrl = (bike) => {
  // Priority 1: External image URL
  if (bike.image_url) {
    return bike.image_url;
  }
  
  // Priority 2: Cloudinary image URL
  if (bike.image && bike.image.url) {
    return bike.image.url;
  }
  
  // Priority 3: Local image path (for existing images)
  if (bike.image && typeof bike.image === 'string') {
    // Check if it's already a full URL
    if (bike.image.startsWith('http')) {
      return bike.image;
    }
    // Convert relative path to full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'https://bike-rental-backend-jmhr.onrender.com/api/v1/';
    const apiBase = baseUrl.replace('/api/v1/', '');
    return `${apiBase}${bike.image}`;
  }
  
  // No image available
  return null;
};

// Function to check if image URL is valid
export const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http') || url.startsWith('https');
}; 