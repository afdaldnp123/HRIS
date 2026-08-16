import prisma from "../src/lib/prisma";

async function main() {
  console.log("Membuat data Payroll Dummy (PAID)...");
  
  const employees = await prisma.employee.findMany();
  
  const today = new Date();
  
  const periodMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const periodYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  
  // Payroll untuk bulan lalu
  const payroll = await prisma.payroll.upsert({
    where: { periodMonth_periodYear: { periodMonth, periodYear } },
    update: { status: "PAID" },
    create: {
      periodMonth,
      periodYear,
      status: "PAID"
    }
  });

  await prisma.payrollItem.deleteMany({ where: { payrollId: payroll.id } });

  for (const emp of employees) {
    await prisma.payrollItem.create({
      data: {
        payrollId: payroll.id,
        employeeId: emp.id,
        baseSalarySnap: 6000000,
        totalAllowances: 500000,
        totalDeductions: 100000,
        bpjsEmployeeSnap: 150000,
        bpjsCompanySnap: 300000,
        pph21Snap: 0,
        netSalary: 6250000,
        detailsJson: { allowances: [], deductions: [] }
      }
    });
  }

  console.log("✅ Data Payroll berhasil digenerate.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
