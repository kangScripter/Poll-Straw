/**
 * Script to promote a user to admin role
 * 
 * Usage:
 *   npx tsx scripts/promote-to-admin.ts <email>
 * 
 * Example:
 *   npx tsx scripts/promote-to-admin.ts user@example.com
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (tsx handles path resolution)
config({ path: resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function promoteToAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`ℹ️  User "${email}" is already an admin`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`
✅ Successfully promoted user to admin:
   Email: ${updatedUser.email}
   Name: ${updatedUser.name || 'N/A'}
   Role: ${updatedUser.role}
   ID: ${updatedUser.id}
    `);
  } catch (error: any) {
    console.error('❌ Error promoting user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error(`
❌ Error: Email address is required

Usage:
  npx tsx scripts/promote-to-admin.ts <email>

Example:
  npx tsx scripts/promote-to-admin.ts user@example.com
  `);
  process.exit(1);
}

promoteToAdmin(email);
