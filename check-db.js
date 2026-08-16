const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const r = await prisma.reimbursement.findMany({
    select: { id: true, amount: true, status: true, date: true, payrollItemId: true, employeeId: true }
  });
  console.log('Reimbursements:', JSON.stringify(r, null, 2));

  const pi = await prisma.payrollItem.findMany({
    include: { payroll: true, reimbursements: true }
  });
  
  console.log('PayrollItems with Reimbursements:', JSON.stringify(pi.map(p => ({
    id: p.id,
    month: p.payroll.periodMonth,
    totalAllowances: p.totalAllowances,
    reimbursements: p.reimbursements.map(r => r.id)
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
