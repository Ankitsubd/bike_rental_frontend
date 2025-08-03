# Frontend Configuration Guide

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_URL=https://bike-rental-backend-jmhr.onrender.com/api/v1/

# Development Configuration
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# For local development, use:
# VITE_API_URL=http://127.0.0.1:8000/api/v1/
```

## Configuration Details

### VITE_API_URL
- **Production:** `https://bike-rental-backend-jmhr.onrender.com/api/v1/`
- **Development:** `http://127.0.0.1:8000/api/v1/`
- **Required:** Yes

### VITE_ENABLE_DEBUG
- **Purpose:** Enable debug logging
- **Production:** `false`
- **Development:** `true`
- **Required:** No (defaults to false)

### VITE_ENABLE_ANALYTICS
- **Purpose:** Enable analytics tracking
- **Production:** `true`
- **Development:** `false`
- **Required:** No (defaults to false)

## Deployment

### Vercel
1. Set environment variables in Vercel dashboard
2. Deploy automatically from GitHub
3. No additional configuration needed

### Local Development
1. Copy `.env.example` to `.env`
2. Update `VITE_API_URL` to point to local backend
3. Run `npm run dev`

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` is correct
- Ensure backend is running
- Check CORS configuration

### Build Issues
- Clear node_modules and reinstall
- Check environment variables
- Verify all dependencies are installed 