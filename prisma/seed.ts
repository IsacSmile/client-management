import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'demo@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'demo1234';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const user = await prisma.user.create({
    data: {
      email: adminEmail.toLowerCase().trim(),
      name: adminName.trim(),
      passwordHash,
    },
  });
  console.log('Created admin user:', user.email);

  // 1. ABC Company
  const clientABC = await prisma.client.create({
    data: {
      name: 'ABC Company',
      email: 'contact@abccompany.com',
      phone: '+91 9876543210',
    },
  });

  const projectABC = await prisma.project.create({
    data: {
      clientId: clientABC.id,
      name: 'Website',
      scope: 'Full corporate website redesign and development using Next.js & Tailwind CSS.',
      totalAmount: 150000,
      status: 'InProgress',
      progress: 50,
    },
  });

  await prisma.payment.create({
    data: {
      clientId: clientABC.id,
      projectId: projectABC.id,
      amount: 50000,
      paymentDate: new Date('2026-09-01'),
      note: 'Upfront Payment',
    },
  });

  // 2. XYZ Studio
  const clientXYZ = await prisma.client.create({
    data: {
      name: 'XYZ Studio',
      email: 'hello@xyzstudio.com',
      phone: '+91 9876543211',
    },
  });

  await prisma.project.create({
    data: {
      clientId: clientXYZ.id,
      name: 'Automation',
      scope: 'Zapier and API workflow integration for CRM & invoicing pipeline.',
      totalAmount: 80000,
      status: 'NotStarted',
      progress: 0,
    },
  });

  // 3. John Doe
  const clientJohn = await prisma.client.create({
    data: {
      name: 'John Doe',
      email: 'john@johndoe.com',
      phone: '+91 9876543212',
    },
  });

  const projectJohn = await prisma.project.create({
    data: {
      clientId: clientJohn.id,
      name: 'E-commerce Website',
      scope: 'Custom Shopify store theme design, product catalog import, and setup.',
      totalAmount: 120000,
      status: 'Completed',
      progress: 100,
    },
  });

  await prisma.payment.create({
    data: {
      clientId: clientJohn.id,
      projectId: projectJohn.id,
      amount: 120000,
      paymentDate: new Date('2026-08-15'),
      note: 'Full Payment',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
