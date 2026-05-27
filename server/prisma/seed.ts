import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/password.service';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin user already exists!');
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      password: passwordHash,
      isApproved: true,
      isAdmin: true,
    },
  });

  console.log('Admin user created successfully:');
  console.log(`- Email: ${admin.email}`);
  console.log(`- Password: [HIDDEN]`);
  console.log(`- Status: Approved & Admin`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
