# 🚀 PollStraw Deployment Guide

## Overview

This guide covers deploying PollStraw to production. The app consists of:
- **Backend API** (Node.js/Express with Socket.io)
- **Mobile App** (React Native/Expo)
- **Database** (PostgreSQL)
- **Cache** (Redis)

---

## ⚠️ Important: Platform Considerations

### Vercel Limitations
Vercel is **serverless** and has limitations:
- ❌ **No persistent WebSocket connections** (Socket.io won't work for real-time)
- ❌ **10-second timeout** on free tier (30s on Pro)
- ✅ Great for static pages and simple API routes

### Recommended Platforms

| Component | Recommended Platform | Alternative |
|-----------|---------------------|-------------|
| Backend API | **Railway** or **Render** | Fly.io, DigitalOcean |
| Database | **Neon** (PostgreSQL) | Supabase, PlanetScale |
| Redis | **Upstash** | Redis Cloud |
| Mobile App | **Expo EAS** | - |

---

## 🟢 Option 1: Deploy to Railway (Recommended)

Railway supports WebSockets and is ideal for this project.

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy Backend
```bash
# In the backend folder
cd backend

# Initialize Railway
railway login
railway init

# Link to project
railway link

# Deploy
railway up
```

### Step 3: Add Services in Railway Dashboard
1. **PostgreSQL**: Click "New" → "Database" → "PostgreSQL"
2. **Redis**: Click "New" → "Database" → "Redis"

### Step 4: Set Environment Variables
In Railway dashboard → Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-secure-secret-32-chars-min
JWT_REFRESH_SECRET=another-secure-secret-32-chars
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://pollstraw.com,https://www.pollstraw.com
```

### Step 5: Configure Domain
1. Go to Settings → Domains
2. Add custom domain: `api.pollstraw.com`
3. Update DNS records as instructed

---

## 🟡 Option 2: Deploy to Vercel (API Only)

Use this if you don't need real-time WebSocket features.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Configure Environment Variables

Create environment variables in Vercel Dashboard or via CLI:
```bash
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
```

### Step 3: Deploy Backend
```bash
cd backend
vercel --prod
```

### Step 4: Set Custom Domain
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `api.pollstraw.com`
3. Update DNS:
   - Type: CNAME
   - Name: api
   - Value: cname.vercel-dns.com

---

## 🗄️ Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Create a new project

### Step 2: Get Connection String
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Run Migrations
```bash
cd backend
npx prisma migrate deploy
```

---

## 📦 Redis Setup (Upstash)

### Step 1: Create Upstash Account
1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database

### Step 2: Get Connection String
```
REDIS_URL=rediss://default:xxx@global-xxx.upstash.io:6379
```

Note: Use `rediss://` (with SSL) for Upstash.

---

## 📱 Mobile App Deployment (Expo EAS)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Configure EAS
```bash
cd mobile
eas login
eas build:configure
```

### Step 3: Update app.json for Production
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.pollstraw.com/api",
      "socketUrl": "https://api.pollstraw.com"
    }
  }
}
```

### Step 4: Build for iOS
```bash
eas build --platform ios --profile production
```

### Step 5: Build for Android
```bash
eas build --platform android --profile production
```

### Step 6: Submit to Stores
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 🌐 Domain & DNS Setup

### For pollstraw.com:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your server IP |
| CNAME | api | Your API host (e.g., railway.app domain) |
| CNAME | www | Your frontend host |

### SSL Certificates
- Railway/Render/Vercel: Automatic SSL
- Custom server: Use Let's Encrypt

---

## 🔧 Production Environment Variables

### Backend (.env.production)
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/pollstraw?sslmode=require

# Redis
REDIS_URL=rediss://default:xxx@host:6379

# JWT
JWT_SECRET=your-production-secret-minimum-32-characters
JWT_REFRESH_SECRET=another-production-secret-minimum-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://pollstraw.com,https://www.pollstraw.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.pollstraw.com/api",
      "socketUrl": "https://api.pollstraw.com"
    }
  }
}
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Update all `appvote` references to `pollstraw`
- [ ] Generate production JWT secrets
- [ ] Set up production database
- [ ] Set up production Redis
- [ ] Update CORS origins
- [ ] Test all API endpoints locally

### Backend Deployment
- [ ] Set environment variables
- [ ] Deploy to Railway/Render/Vercel
- [ ] Run database migrations
- [ ] Verify API health endpoint
- [ ] Configure custom domain
- [ ] Enable SSL

### Mobile Deployment
- [ ] Update API URLs in app.json
- [ ] Configure app signing (iOS/Android)
- [ ] Build production apps
- [ ] Test on physical devices
- [ ] Submit to app stores

### Post-Deployment
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy
- [ ] Document runbooks

---

## 🔍 Monitoring & Logging

### Recommended Services
- **Error Tracking**: Sentry
- **Logging**: LogTail, Papertrail
- **Uptime**: UptimeRobot, Better Uptime
- **Analytics**: Mixpanel, Amplitude

### Add Sentry to Backend
```bash
npm install @sentry/node
```

```typescript
// In app.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🆘 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL format includes `?sslmode=require`
- Verify IP allowlist in database dashboard
- Check connection string credentials

### "Redis connection failed"
- Use `rediss://` for SSL connections
- Verify Upstash credentials
- Check Redis URL format

### "CORS error"
- Update CORS_ORIGIN in environment variables
- Include all frontend domains (with and without www)

### "Socket.io not connecting"
- Vercel doesn't support WebSockets - use Railway/Render
- Check CORS configuration for Socket.io

### "Build failed on Vercel"
- Check Node.js version compatibility
- Review build logs for specific errors
- Ensure all dependencies are in package.json

---

## 📞 Support Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Expo EAS Docs: https://docs.expo.dev/eas/
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://docs.upstash.com
