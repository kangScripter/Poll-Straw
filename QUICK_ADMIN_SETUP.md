# Quick Admin Setup Guide

## 🚀 Fastest Way to Create an Admin User

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Run the Promotion Script

**Option A: Promote an existing user to admin**
```bash
npm run admin:promote your-email@example.com
```

**Option B: Create a new admin user**
```bash
npm run admin:create admin@example.com YourPassword123 "Admin Name"
```

### Step 3: Verify

1. Login to the mobile app with the admin credentials
2. Go to Profile screen
3. You should see "Admin Dashboard" menu item
4. Tap it to access admin features

## 📝 Examples

```bash
# Promote your existing account
cd backend
npm run admin:promote srikanth@example.com

# Create a dedicated admin account
cd backend
npm run admin:create admin@pollstraw.com SecurePass123 "Admin User"
```

## ⚠️ Important Notes

- Make sure your `.env` file in `backend/` has the correct `DATABASE_URL`
- The database must be accessible and migrations must be run
- Password for new admin must be at least 8 characters

## 🔍 Troubleshooting

If scripts don't work, you can also use Prisma Studio:

```bash
cd backend
npm run db:studio
```

Then manually update a user's role to `ADMIN` in the GUI.
