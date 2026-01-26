/**
 * Script to create a new admin user
 * 
 * Usage:
 *   npx tsx scripts/create-admin.ts <email> <password> [name]
 * 
 * Example:
 *   npx tsx scripts/create-admin.ts admin@example.com SecurePass123 "Admin User"
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (tsx handles path resolution)
config({ path: resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function createAdmin(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.error(`❌ User with email "${email}" already exists`);
      console.log(`   To promote existing user to admin, use:`);
      console.log(`   npx tsx scripts/promote-to-admin.ts ${email}`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`
✅ Successfully created admin user:
   Email: ${adminUser.email}
   Name: ${adminUser.name || 'N/A'}
   Role: ${adminUser.role}
   ID: ${adminUser.id}
   Created: ${adminUser.createdAt.toLocaleString()}

⚠️  Please save these credentials securely!
    `);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password) {
  console.error(`
❌ Error: Email and password are required

Usage:
  npx tsx scripts/create-admin.ts <email> <password> [name]

Example:
  npx tsx scripts/create-admin.ts admin@example.com SecurePass123 "Admin User"
  `);
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Error: Password must be at least 8 characters long');
  process.exit(1);
}

createAdmin(email, password, name);
