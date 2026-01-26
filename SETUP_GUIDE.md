# 🚀 PollStraw Setup Guide

## 📍 Environment Variables Location

### Backend Environment Variables

**Location:** `backend/.env`

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your values:
   ```bash
   # On Windows
   notepad .env
   
   # On Mac/Linux
   nano .env
   ```

### Mobile App Environment Variables

**Location:** `mobile/app.json` (in the `extra` section)

The mobile app uses Expo's configuration. Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000/api",
      "socketUrl": "http://localhost:3000"
    }
  }
}
```

**For physical device testing**, replace `localhost` with your computer's IP address:
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Example: `http://192.168.1.100:3000/api`

---

## 🔧 Quick Setup Steps

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your values (see below)

# Generate Prisma client
npm run db:generate

# Start database (in another terminal)
cd ..
docker-compose up -d

# Push database schema
cd backend
npm run db:push

# Start development server
npm run dev
```

### 2. Mobile Setup

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Update app.json if needed (for device testing)

# Start Expo
npx expo start
```

---

## 📝 Minimum Required `.env` Values

Create `backend/.env` with at least these values:

```env
# Database (matches Docker Compose defaults)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pollstraw?schema=public"

# Redis (matches Docker Compose defaults)
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generate your own - see below)
JWT_SECRET="generate-a-random-32-character-string-here"
JWT_REFRESH_SECRET="generate-another-random-32-character-string-here"
```

---

## 🔑 Generate JWT Secrets

### Windows (PowerShell):
```powershell
# Generate random secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Mac/Linux:
```bash
# Generate random secret
openssl rand -base64 32
```

### Online:
Use a secure random string generator (minimum 32 characters)

---

## ✅ Verify Setup

### Check Backend:
```bash
cd backend
npm run dev
```

Should see:
```
✅ Database connected successfully
✅ Redis connected successfully
✅ Socket.io initialized
🗳️  AppVote API Server
   Port: 3000
   API: http://localhost:3000/api
```

### Check Mobile:
```bash
cd mobile
npx expo start
```

Should see Expo DevTools in browser.

---

## 🐛 Troubleshooting

### "Database connection failed"
- Make sure Docker is running: `docker-compose up -d`
- Check DATABASE_URL in `.env` matches Docker setup

### "Redis connection failed"
- Check Redis is running: `docker ps`
- Check REDIS_URL in `.env`

### "JWT_SECRET must be at least 32 characters"
- Generate a longer secret (see above)
- Make sure there are no quotes around the value in `.env`

### Mobile can't connect to API
- For physical device: Use your computer's IP instead of `localhost`
- Check firewall allows port 3000
- Make sure backend is running

---

## 📁 File Structure

```
AppVote/
├── backend/
│   ├── .env              ← Create this file here
│   ├── .env.example      ← Reference file
│   └── src/
│
├── mobile/
│   ├── app.json          ← Update "extra" section here
│   └── src/
│
└── docker-compose.yml    ← Database & Redis config
```

---

## 🔒 Security Reminder

- ✅ `.env` is in `.gitignore` (won't be committed)
- ❌ Never commit `.env` to Git
- ❌ Never share secrets publicly
- ✅ Use different secrets for production
