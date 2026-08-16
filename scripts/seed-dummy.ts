import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { encryptData } from "../src/lib/encryption";
import { EmploymentStatus, AttendanceStatus, LeaveStatus, ComponentType } from "@prisma/client";

async function main() {
  console.log("Memulai proses injeksi data dummy HRIS...");

  // 1. Departemen
  const deps = [
    { code: "HR", name: "Human Resources" },
    { code: "ENG", name: "Engineering" },
    { code: "FIN", name: "Finance" },
    { code: "MKT", name: "Marketing" },
    { code: "OPS", name: "Operations" },
  ];

  const dbDeps = [];
  for (const d of deps) {
    dbDeps.push(await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: d
    }));
  }
  console.log("✅ Departemen berhasil dibuat.");

  // 2. Tunjangan & Potongan (Master Data)
  await prisma.allowanceType.deleteMany({});
  await prisma.deductionType.deleteMany({});

  const allowMakan = await prisma.allowanceType.create({
    data: { name: "Tunjangan Makan", type: ComponentType.DAILY_ATTENDANCE, defaultValue: 50000, isTaxable: true }
  });
  const allowTrans = await prisma.allowanceType.create({
    data: { name: "Tunjangan Transport", type: ComponentType.DAILY_ATTENDANCE, defaultValue: 25000, isTaxable: true }
  });
  const allowKeluarga = await prisma.allowanceType.create({
    data: { name: "Tunjangan Keluarga", type: ComponentType.FIXED_AMOUNT, defaultValue: 1000000, isTaxable: true }
  });
  const dedTelat = await prisma.deductionType.create({
    data: { name: "Potongan Keterlambatan", type: ComponentType.FIXED_AMOUNT, defaultValue: 20000 }
  });
  console.log("✅ Master Tunjangan & Potongan berhasil dibuat.");

  // 3. Karyawan (15 Dummy Users)
  const passwordHash = await bcrypt.hash("Password123!", 10);
  
  const names = [
    "Budi Santoso", "Siti Aminah", "Rina Marlina", "Andi Wijaya", "Dewi Lestari",
    "Agus Pratama", "Maya Sari", "Reza Rahadian", "Dian Sastrowardoyo", "Hendra Gunawan",
    "Fitri Yani", "Irfan Hakim", "Lina Melinda", "Toni Haryanto", "Putri Utami"
  ];

  const statuses = [EmploymentStatus.PERMANENT, EmploymentStatus.CONTRACT, EmploymentStatus.PROBATION];

  const employees = [];
  
  // Clear existing (except admin/first employee if needed, but we'll just upsert by email)
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const email = `karyawan${i+1}@perusahaan.com`;
    const nip = `EMP${new Date().getFullYear()}${String(i + 1).padStart(4, '0')}`;
    const dept = dbDeps[i % dbDeps.length];
    const status = statuses[i % 3];
    const salary = (5000000 + (Math.random() * 10000000)).toFixed(0);

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash, role: "EMPLOYEE", isActive: true }
    });

    const emp = await prisma.employee.upsert({
      where: { userId: user.id },
      update: { 
        departmentId: dept.id,
        status,
        baseSalary: encryptData(salary),
        bankName: "BCA",
        bankAccountNumber: encryptData(`123456789${i}`),
      },
      create: {
        userId: user.id,
        departmentId: dept.id,
        nip,
        fullName: name,
        phone: `08123456789${i}`,
        joinDate: new Date(2023, i % 12, (i % 28) + 1),
        status,
        baseSalary: encryptData(salary),
        bankName: "BCA",
        bankAccountNumber: encryptData(`123456789${i}`),
        ptkpCode: i % 2 === 0 ? "TK/0" : "K/1",
      }
    });

    employees.push(emp);
  }
  console.log("✅ 15 Data Karyawan berhasil dibuat.");

  // 4. Absensi (2 Minggu Terakhir)
  await prisma.attendance.deleteMany({});
  
  const today = new Date();
  today.setHours(0,0,0,0);

  let totalAttendances = 0;
  for (const emp of employees) {
    for (let day = 1; day <= 14; day++) {
      const d = new Date(today);
      d.setDate(d.getDate() - day);
      
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const rand = Math.random();
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      let inHour = 8;
      let inMin = Math.floor(Math.random() * 59);

      if (rand > 0.8) {
        status = AttendanceStatus.LATE;
        inHour = 9;
        inMin = Math.floor(Math.random() * 30);
      } else if (rand > 0.95) {
        status = AttendanceStatus.ABSENT;
      }

      if (status !== AttendanceStatus.ABSENT) {
        const clockIn = new Date(d);
        clockIn.setHours(inHour, inMin, 0);

        const clockOut = new Date(d);
        clockOut.setHours(17, Math.floor(Math.random() * 59), 0);

        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: d,
            clockIn,
            clockOut,
            status,
            workMinutes: 480
          }
        });
        totalAttendances++;
      }
    }
  }
  console.log(`✅ ${totalAttendances} Log Absensi berhasil digenerate.`);

  // 5. Cuti
  await prisma.leave.deleteMany({});
  for (let i = 0; i < 5; i++) {
    const emp = employees[i];
    const s = new Date(today);
    s.setDate(s.getDate() + (i * 2));
    const e = new Date(s);
    e.setDate(e.getDate() + 2);

    await prisma.leave.create({
      data: {
        employeeId: emp.id,
        startDate: s,
        endDate: e,
        reason: `Cuti tahunan untuk liburan keluarga ke-${i+1}`,
        status: i % 2 === 0 ? LeaveStatus.PENDING : LeaveStatus.APPROVED
      }
    });
  }
  console.log("✅ Data Pengajuan Cuti berhasil dibuat.");

  console.log("🎉 SELURUH DATA DUMMY BERHASIL DI-GENERATE!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
