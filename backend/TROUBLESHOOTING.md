# 🔧 Backend Troubleshooting Guide

## Common Issues and Solutions

### 404 Error: Route Not Found

If you're getting `{"success":false,"error":"Route /api/auth/login not found"}`:

#### 1. Check Route Registration

Verify routes are properly registered in `src/routes/index.ts`:
```typescript
router.use('/auth', authRoutes);
```

#### 2. Verify Route Mounting

Check `src/app.ts` mounts routes correctly:
```typescript
app.use('/api', routes);
```

#### 3. Test Health Endpoint

First, test if the API is running:
```bash
curl https://api.pollstraw.com/api/health
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

#### 4. Test Route Registration

Test if routes are registered:
```bash
curl https://api.pollstraw.com/api/test
```

Should return available routes.

#### 5. Redeploy Backend

If routes aren't working, redeploy:

**Railway:**
```bash
cd backend
railway up
```

Or trigger a new deployment from Railway dashboard.

#### 6. Check Build Logs

In Railway dashboard:
1. Go to **Deployments**
2. Check the latest deployment logs
3. Look for any errors during build or startup

#### 7. Verify Environment Variables

Ensure all required environment variables are set:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`

#### 8. Check Server Logs

View real-time logs:
```bash
railway logs
```

Or in Railway dashboard → **Deployments** → **View Logs**

---

## Route Structure

The API routes are structured as:
```
/api
  /health          → GET  - Health check
  /test            → GET  - Route test
  /auth
    /login         → POST - Login
    /register      → POST - Register
    /refresh       → POST - Refresh token
    /logout        → POST - Logout
    /forgot-password → POST
    /reset-password  → POST
    /me            → GET  - Get current user
  /polls
    ...
  /user
    ...
  /admin
    ...
```

---

## Testing Routes Locally

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### 3. Test Login Route
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

---

## Production Deployment Checklist

- [ ] Backend is deployed and running
- [ ] Environment variables are set
- [ ] Database migrations are run
- [ ] Routes are accessible at `/api/health`
- [ ] CORS is configured for production domains
- [ ] SSL certificate is valid
- [ ] Server logs show no errors

---

## Quick Fixes

### Restart Backend (Railway)
1. Go to Railway dashboard
2. Click on your service
3. Click **"Restart"** button

### Clear Cache and Redeploy
```bash
cd backend
railway up --clear-cache
```

### Check Route Registration
Add this to `src/routes/index.ts` temporarily:
```typescript
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    routes: router.stack.map((r: any) => ({
      path: r.route?.path,
      method: r.route?.methods,
    })),
  });
});
```

Then visit: `https://api.pollstraw.com/api/debug`

---

## Still Not Working?

1. **Check Railway logs** for startup errors
2. **Verify database connection** is working
3. **Test locally** first to ensure routes work
4. **Check CORS** configuration for your domain
5. **Verify** the deployment completed successfully
