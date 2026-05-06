import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding database...');
    const adminEmail = 'admin@example.com';
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });
    if (existingAdmin) {
        console.log('Admin user already exists!');
        return;
    }
    // Create admin user
    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: adminEmail,
            password: 'adminpassword123', // In a real app, ensure this is hashed
            isApproved: true,
            isAdmin: true,
        }
    });
    console.log('Admin user created successfully:');
    console.log(`- Email: ${admin.email}`);
    console.log(`- Password: adminpassword123`);
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
