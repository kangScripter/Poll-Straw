# Environment Variables Setup Guide

## 📍 Where to Create `.env` File

Create the `.env` file in the **`backend/`** directory:

```
AppVote/
└── backend/
    ├── .env          ← Create this file here
    ├── .env.example  ← Reference file
    └── src/
```

## 🚀 Quick Setup

### Step 1: Copy the example file

```bash
cd backend
cp .env.example .env
```

### Step 2: Edit `.env` file

Open `.env` in your text editor and update the values:

```env
# Required - Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appvote?schema=public"

# Required - Redis
REDIS_URL="redis://localhost:6379"

# Required - JWT Secrets (generate strong random strings)
JWT_SECRET="your-secret-here-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-here-min-32-chars"

# Optional - Server
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:8081"
```

## 🔑 Generating JWT Secrets

### Option 1: Using OpenSSL (Recommended)
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Online Generator
Use a secure random string generator (minimum 32 characters)

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string |
| `REDIS_URL` | **Yes** | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | **Yes** | - | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | - | Secret for refresh tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `15m` | Access token expiration |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiration |
| `FRONTEND_URL` | No | `http://localhost:8081` | Frontend URL for CORS |

## 🔒 Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use different secrets for production** - Never use development secrets in production
3. **JWT secrets must be at least 32 characters** - The app will fail to start if too short
4. **Keep secrets secure** - Don't share them in chat, email, or public places

## 🐳 Docker Setup

If using Docker Compose (default setup):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appvote?schema=public"
REDIS_URL="redis://localhost:6379"
```

These match the default Docker Compose configuration.

## 🌐 Production Setup

For production, update these values:

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db-host:5432/appvote?schema=public"
REDIS_URL="redis://prod-redis-host:6379"
FRONTEND_URL="https://yourdomain.com"
# Use strong, unique secrets
JWT_SECRET="production-secret-min-32-chars"
JWT_REFRESH_SECRET="production-refresh-secret-min-32-chars"
```

## ✅ Verification

After creating `.env`, verify it's loaded:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ Redis connected successfully
✅ Socket.io initialized
```

If you see errors about missing variables, check your `.env` file.
