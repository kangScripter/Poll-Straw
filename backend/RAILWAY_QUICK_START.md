# 🚂 Railway Quick Start

## Quick Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Railway"
   git push
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repo
   - Set root directory to: `backend`

3. **Add Services**
   - Click "+ New" → Database → PostgreSQL
   - Click "+ New" → Database → Redis (optional)

4. **Set Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=<generate-32-char-secret>
   JWT_REFRESH_SECRET=<generate-32-char-secret>
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://pollstraw.com,https://www.pollstraw.com
   ```

5. **Run Migrations**
   ```bash
   railway run npm run db:migrate
   ```

6. **Deploy**
   - Railway auto-deploys on push
   - Or click "Deploy" in dashboard

## Generate JWT Secrets

**PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Bash:**
```bash
openssl rand -base64 32
```

## Verify Deployment

Visit: `https://your-app.up.railway.app/api/health`

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

## Common Issues

### Build Error: "scripts not under rootDir"
✅ **Fixed**: Updated `tsconfig.json` to exclude `scripts/`

### Database Connection Failed
- Check `DATABASE_URL` includes `?sslmode=require`
- Verify PostgreSQL service is running

### Port Error
- Railway sets `PORT` automatically
- App uses `process.env.PORT` ✅

---

See `RAILWAY_DEPLOYMENT.md` for detailed guide.
