import { PrismaClient, EmploymentStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encryptData } from './src/lib/encryption';

const prisma = new PrismaClient();

async function main() {
  const dept = await prisma.department.upsert({
    where: { code: 'IT-01' },
    update: {},
    create: {
      code: 'IT-01',
      name: 'Engineering',
    },
  });

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const employeeUser = await prisma.user.upsert({
    where: { email: 'karyawan@perusahaan.com' },
    update: {},
    create: {
      email: 'karyawan@perusahaan.com',
      passwordHash,
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  const baseSalaryEnc = encryptData('8000000');
  const bankEnc = encryptData('1234567890');

  const employee = await prisma.employee.upsert({
    where: { nip: 'EMP-001' },
    update: {},
    create: {
      userId: employeeUser.id,
      departmentId: dept.id,
      nip: 'EMP-001',
      fullName: 'Budi Santoso',
      phone: '081234567890',
      joinDate: new Date('2026-01-01'),
      status: EmploymentStatus.PERMANENT,
      baseSalary: baseSalaryEnc,
      bankName: 'BCA',
      bankAccountNumber: bankEnc,
      ptkpCode: 'TK/0',
    },
  });

  console.log('Dummy Karyawan berhasil dibuat:');
  console.log('Email: karyawan@perusahaan.com');
  console.log('Password: Password123!');
}

main().catch(console.error);
