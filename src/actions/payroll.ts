"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculatePayroll } from "@/lib/payroll-engine";
import { PayrollStatus } from "@prisma/client";

export async function generateDraftPayroll(periodMonth: number, periodYear: number) {
  try {
    const existing = await prisma.payroll.findUnique({
      where: { periodMonth_periodYear: { periodMonth, periodYear } }
    });
    if (existing) return { success: false, error: "Payroll untuk periode ini sudah ada" };

    const employees = await prisma.employee.findMany();
    if (employees.length === 0) return { success: false, error: "Tidak ada karyawan untuk diproses" };

    let totalDisbursed = 0;

    await prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.create({
        data: {
          periodMonth,
          periodYear,
          status: PayrollStatus.DRAFT,
          totalDisbursed: 0
        }
      });

      for (const emp of employees) {
        const calc = calculatePayroll(emp.baseSalary, emp.ptkpCode);
        
        // Cari reimbursement yang APPROVED tapi belum masuk ke payroll mana pun
        const unpaidReimbursements = await tx.reimbursement.findMany({
          where: { employeeId: emp.id, status: "APPROVED", payrollItemId: null }
        });

        const totalReimbursement = unpaidReimbursements.reduce((acc, r) => acc + Number(r.amount), 0);
        
        // Reimbursement ditambahkan murni ke netSalary (bebas pajak)
        const finalNetSalary = calc.netSalary + totalReimbursement;
        totalDisbursed += finalNetSalary;

        const allowancesJson = unpaidReimbursements.map(r => ({
          name: `Reimbursement: ${r.description}`,
          amount: Number(r.amount)
        }));

        const payrollItem = await tx.payrollItem.create({
          data: {
            payrollId: payroll.id,
            employeeId: emp.id,
            baseSalarySnap: calc.baseSalary,
            totalAllowances: totalReimbursement,
            totalDeductions: 0,
            bpjsCompanySnap: calc.bpjsCompany,
            bpjsEmployeeSnap: calc.bpjsEmployee,
            pph21Snap: calc.pph21,
            netSalary: finalNetSalary,
            detailsJson: JSON.stringify({ allowances: allowancesJson, deductions: [] })
          }
        });

        // Tautkan reimbursement ke payrollItem ini
        if (unpaidReimbursements.length > 0) {
          await tx.reimbursement.updateMany({
            where: { id: { in: unpaidReimbursements.map(r => r.id) } },
            data: { payrollItemId: payrollItem.id }
          });
        }
      }

      await tx.payroll.update({
        where: { id: payroll.id },
        data: { totalDisbursed }
      });
    });

    revalidatePath("/admin/payroll");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePayrollStatus(payrollId: string, newStatus: PayrollStatus) {
  try {
    const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
    if (!payroll) return { success: false, error: "Payroll tidak ditemukan" };

    if (payroll.status === PayrollStatus.PAID) {
      return { success: false, error: "Payroll sudah berstatus PAID (Terkunci)" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.payroll.update({
        where: { id: payrollId },
        data: { status: newStatus, processedAt: newStatus === PayrollStatus.PAID ? new Date() : null }
      });

      if (newStatus === PayrollStatus.PAID) {
        // Tandai semua reimbursement yang tergabung dalam payroll ini menjadi PAID
        const payrollItems = await tx.payrollItem.findMany({
          where: { payrollId }
        });
        
        if (payrollItems.length > 0) {
          await tx.reimbursement.updateMany({
            where: { payrollItemId: { in: payrollItems.map(pi => pi.id) } },
            data: { status: "PAID" }
          });
        }
      }
    });

    revalidatePath("/admin/payroll");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDraftPayroll(payrollId: string) {
  try {
    const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
    if (!payroll) return { success: false, error: "Payroll tidak ditemukan" };

    if (payroll.status !== "DRAFT") {
      return { success: false, error: "Hanya payroll berstatus DRAFT yang bisa dihapus" };
    }

    await prisma.payroll.delete({
      where: { id: payrollId }
    });

    revalidatePath("/admin/payroll");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
