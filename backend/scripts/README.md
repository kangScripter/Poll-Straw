# Admin Management Scripts

Quick scripts to manage admin users in the AppVote system.

## Quick Start

### Promote Existing User to Admin

```bash
cd backend
npm run admin:promote user@example.com
```

Or directly:
```bash
cd backend
npx tsx scripts/promote-to-admin.ts user@example.com
```

### Create New Admin User

```bash
cd backend
npm run admin:create admin@example.com SecurePassword123 "Admin Name"
```

Or directly:
```bash
cd backend
npx tsx scripts/create-admin.ts admin@example.com SecurePassword123 "Admin Name"
```

## Examples

```bash
# Promote your existing account
npm run admin:promote your-email@gmail.com

# Create a new admin
npm run admin:create admin@pollstraw.com MySecurePass123 "Admin User"
```

## Requirements

- Node.js 18+
- Database connection configured in `.env`
- Prisma client generated (`npm run db:generate`)
