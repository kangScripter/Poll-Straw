# Admin User Setup Guide

This guide explains how to create or promote a user to admin role in the AppVote system.

## Method 1: Using Scripts (Recommended) ⭐

### Option A: Promote Existing User to Admin

If you already have a user account and want to make them an admin:

```bash
cd backend
npm run admin:promote user@example.com
```

Or directly:
```bash
cd backend
npx tsx scripts/promote-to-admin.ts user@example.com
```

Replace `user@example.com` with the email of the user you want to promote.

### Option B: Create New Admin User

To create a brand new admin user:

```bash
cd backend
npm run admin:create admin@example.com SecurePassword123 "Admin Name"
```

Or directly:
```bash
cd backend
npx tsx scripts/create-admin.ts admin@example.com SecurePassword123 "Admin Name"
```

**Parameters:**
- `admin@example.com` - Email address (required)
- `SecurePassword123` - Password (must be at least 8 characters)
- `Admin Name` - Display name (optional)

## Method 2: Using Prisma Studio (GUI)

1. Open Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```

2. Navigate to the `User` model
3. Find the user you want to promote
4. Click on the user
5. Change the `role` field from `USER` to `ADMIN`
6. Click "Save 1 change"

## Method 3: Using SQL Directly

Connect to your PostgreSQL database and run:

```sql
-- Promote existing user to admin
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'user@example.com';

-- Or create a new admin user (you'll need to hash the password first)
-- Use bcrypt to hash the password, then:
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2a$12$hashed_password_here', -- Use bcrypt to hash
  'Admin User',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

## Method 4: Using Node.js REPL

```bash
cd backend
node
```

Then in the Node.js REPL:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Promote user to admin
await prisma.user.update({
  where: { email: 'user@example.com' },
  data: { role: 'ADMIN' }
});

// Or create new admin
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('SecurePassword123', 12);

await prisma.user.create({
  data: {
    email: 'admin@example.com',
    password: hashedPassword,
    name: 'Admin User',
    role: 'ADMIN'
  }
});

await prisma.$disconnect();
```

## Verification

After creating/promoting an admin user, verify it worked:

1. **Check via script:**
   ```bash
   cd backend
   npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.findMany({ where: { role: 'ADMIN' }, select: { email: true, name: true, role: true } }).then(console.log).finally(() => p.\$disconnect());"
   ```

2. **Login to the mobile app** with the admin credentials
3. **Check Profile screen** - you should see "Admin Dashboard" menu item
4. **Access Admin Dashboard** - should show analytics and admin features

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit admin credentials** to version control
2. **Use strong passwords** for admin accounts (minimum 12 characters recommended)
3. **Limit admin access** - only promote trusted users
4. **Monitor admin activity** - review admin actions regularly
5. **Use environment variables** for sensitive operations in production

## Troubleshooting

### "User not found" error
- Verify the email address is correct
- Check if the user exists in the database
- Ensure you're connected to the correct database

### "Permission denied" error
- Check database connection string in `.env`
- Verify database user has UPDATE permissions
- Ensure Prisma migrations are up to date

### Script not found
- Make sure you're in the `backend/` directory
- Install dependencies: `npm install`
- Check that `tsx` is available: `npm install -g tsx` or use `npx tsx`

## Quick Reference

```bash
# Promote existing user
cd backend
npx tsx scripts/promote-to-admin.ts your-email@example.com

# Create new admin
cd backend
npx tsx scripts/create-admin.ts admin@example.com YourPassword123 "Admin Name"
```
