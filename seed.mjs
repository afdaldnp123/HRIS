import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@perusahaan.com' },
    update: {},
    create: {
      email: 'admin@perusahaan.com',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const dept = await prisma.department.upsert({
    where: { code: 'HR-01' },
    update: {},
    create: {
      code: 'HR-01',
      name: 'Human Resources',
    },
  });

  console.log('Seed berhasil. Kredensial default:');
  console.log('Email: admin@perusahaan.com');
  console.log('Password: Admin123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
