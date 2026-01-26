# 🚂 Railway Deployment Guide for PollStraw

This guide will help you deploy PollStraw backend to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: For connecting your repository
3. **Domain** (optional): For custom domain setup

---

## Step 1: Prepare Your Repository

### 1.1 Ensure Files Are Committed

Make sure these files are in your repository:
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/` (all source files)
- `backend/prisma/schema.prisma`
- `backend/railway.json` (optional)
- `backend/Procfile` (optional)

### 1.2 Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

## Step 2: Create Railway Project

### 2.1 New Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select the **`backend`** folder as the root directory

### 2.2 Configure Root Directory

In Railway dashboard:
1. Go to **Settings** → **Root Directory**
2. Set to: `backend`
3. Save

---

## Step 3: Add Services

### 3.1 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL instance
4. Note the connection details (you'll need them)

### 3.2 Add Redis (Optional but Recommended)

1. Click **"+ New"**
2. Select **"Database"** → **"Add Redis"**
3. Railway will create a Redis instance

---

## Step 4: Configure Environment Variables

### 4.1 In Railway Dashboard

Go to your service → **Variables** tab and add:

```env
# Database (use Railway's reference variable)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (if you added Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-secure-secret-minimum-32-characters-long
JWT_REFRESH_SECRET=another-secure-secret-minimum-32-characters-long

# Server Configuration
NODE_ENV=production
PORT=3000

# CORS (update with your frontend domains)
CORS_ORIGIN=https://pollstraw.com,https://www.pollstraw.com

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4.2 Generate JWT Secrets

**Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Online:**
Use a secure random string generator (minimum 32 characters)

---

## Step 5: Configure Build Settings

### 5.1 Build Command

Railway will auto-detect, but you can verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 5.2 Node.js Version

Railway will use the version specified in `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

---

## Step 6: Run Database Migrations

### 6.1 Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run db:migrate
```

### 6.2 Using Railway Dashboard

1. Go to your service
2. Click **"Deployments"** → **"Latest"**
3. Click **"View Logs"**
4. In the terminal, run:
   ```bash
   railway run npm run db:migrate
   ```

### 6.3 Alternative: One-time Migration Script

Create a migration script that runs on first deploy:

```bash
# In Railway, add this to your start command temporarily:
npm run db:migrate && npm start
```

**⚠️ Note**: Remove this after first migration to avoid running migrations on every restart.

---

## Step 7: Deploy

### 7.1 Automatic Deployment

Railway will automatically deploy when you push to your connected branch (usually `main` or `master`).

### 7.2 Manual Deployment

1. Go to Railway dashboard
2. Click **"Deploy"** button
3. Select your branch
4. Railway will build and deploy

### 7.3 Monitor Deployment

1. Go to **"Deployments"** tab
2. Watch the build logs
3. Check for any errors

---

## Step 8: Configure Custom Domain

### 8.1 Add Domain

1. Go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** (for Railway domain)
   OR
3. Click **"Custom Domain"** → Add your domain: `api.pollstraw.com`

### 8.2 DNS Configuration

For custom domain `api.pollstraw.com`:

1. Railway will provide DNS records
2. Add CNAME record in your DNS provider:
   - **Type**: CNAME
   - **Name**: api
   - **Value**: Railway-provided CNAME (e.g., `xxx.up.railway.app`)

### 8.3 SSL Certificate

Railway automatically provisions SSL certificates via Let's Encrypt.

---

## Step 9: Verify Deployment

### 9.1 Health Check

Visit your Railway domain:
```
https://your-app.up.railway.app/api/health
```

Should return:
```json
{
  "success": true,
  "data": {
    "name": "PollStraw API",
    "version": "1.0.0",
    "status": "healthy"
  }
}
```

### 9.2 Test API Endpoints

```bash
# Test registration
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'
```

---

## Step 10: Update Mobile App Configuration

### 10.1 Update app.json

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

### 10.2 Update Constants

The mobile app will automatically use the production URLs from `app.json`.

---

## Troubleshooting

### Build Fails: "TypeScript compilation error"

**Solution**: Make sure `scripts/` folder is excluded from TypeScript compilation in `tsconfig.json`:
```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "scripts"]
}
```

### Database Connection Failed

**Check**:
1. `DATABASE_URL` is set correctly
2. Database service is running in Railway
3. Connection string includes `?sslmode=require` for production

### Redis Connection Failed

**Check**:
1. `REDIS_URL` is set correctly
2. Redis service is running
3. Use `rediss://` (with SSL) for production Redis

### Port Already in Use

**Solution**: Railway sets `PORT` automatically. Don't hardcode port 3000. Use:
```typescript
const PORT = process.env.PORT || 3000;
```

### Migrations Not Running

**Solution**: Run migrations manually:
```bash
railway run npm run db:migrate
```

Or add to build script (temporary):
```json
"scripts": {
  "build": "npm run db:generate && tsc",
  "postbuild": "npm run db:migrate"
}
```

### CORS Errors

**Solution**: Update `CORS_ORIGIN` environment variable with all allowed domains:
```
CORS_ORIGIN=https://pollstraw.com,https://www.pollstraw.com,https://api.pollstraw.com
```

---

## Railway CLI Commands

```bash
# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run npm run db:migrate

# Open service in browser
railway open

# Show environment variables
railway variables
```

---

## Cost Estimation

Railway pricing (as of 2024):
- **Free Tier**: $5 credit/month
- **Hobby**: $5/month + usage
- **Pro**: $20/month + usage

**Estimated Monthly Cost**:
- PostgreSQL: ~$5-10/month
- Redis: ~$3-5/month
- API Service: ~$5-15/month (depending on usage)
- **Total**: ~$13-30/month

---

## Next Steps

1. ✅ Set up monitoring (Sentry, LogTail)
2. ✅ Configure backups for database
3. ✅ Set up CI/CD pipeline
4. ✅ Add health check endpoint monitoring
5. ✅ Configure rate limiting
6. ✅ Set up SSL certificate monitoring

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**🎉 Congratulations! Your PollStraw API is now deployed on Railway!**
