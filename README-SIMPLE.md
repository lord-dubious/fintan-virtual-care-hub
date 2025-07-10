# Fintan Virtual Care Hub - Simple Setup

## Quick Start

1. **Setup everything:**
   ```bash
   ./setup-simple.sh
   ```

2. **Start the app:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

3. **Access the app:**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

## What's Configured

✅ **Your Neon PostgreSQL database** - Ready to use  
✅ **Daily.co video calls** - With your API key  
✅ **Audio calls enabled**  
✅ **TypeScript working** - Build passes  
✅ **All components typed** - No more prop errors  

## Database

Your Neon database is already configured in `.env`:
```
DATABASE_URL="postgresql://fintan_owner:npg_6WeQhvkUd7Eb@ep-still-dream-a8kckvx0-pooler.eastus2.azure.neon.tech/fintan?sslmode=require&pgbouncer=true&connect_timeout=10"
```

## Cal.com (Optional)

If you want scheduling, you can add Cal.com later. For now, the app works without it.

## That's It!

No Docker complexity, no Redis required, just your Neon DB and the working app.

Build: `npm run build` ✅ Working  
Deploy: Upload `dist/` folder ✅ Ready
