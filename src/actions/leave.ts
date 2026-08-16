"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitLeave(data: { startDate: string; endDate: string; reason: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { success: false, error: "Unauthorized" };

    const employee = await prisma.employee.findUnique({ where: { userId: session.user.id } });
    if (!employee) return { success: false, error: "Karyawan tidak ditemukan" };

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start > end) return { success: false, error: "Tanggal mulai tidak boleh lebih dari tanggal selesai" };

    // Validasi backend
    const currentYear = new Date().getFullYear();
    const leaves = await prisma.leave.findMany({
      where: { 
        employeeId: employee.id,
        status: { in: ["APPROVED", "PENDING"] },
        startDate: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
        }
      }
    });

    let usedLeaves = 0;
    for (const l of leaves) {
      let cur = new Date(l.startDate.getTime());
      while (cur <= l.endDate) {
        if (cur.getDay() !== 0 && cur.getDay() !== 6) usedLeaves++;
        cur.setDate(cur.getDate() + 1);
      }
    }

    let requestedDays = 0;
    let tempCur = new Date(start.getTime());
    while (tempCur <= end) {
      if (tempCur.getDay() !== 0 && tempCur.getDay() !== 6) requestedDays++;
      tempCur.setDate(tempCur.getDate() + 1);
    }

    const remainingLeaves = Math.max(0, 12 - usedLeaves);
    if (requestedDays > remainingLeaves) {
      return { success: false, error: `Gagal: Kuota cuti Anda (${remainingLeaves} hari) tidak mencukupi untuk pengajuan ini (${requestedDays} hari).` };
    }

    await prisma.leave.create({
      data: {
        employeeId: employee.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason
      }
    });

    revalidatePath("/ess/cuti");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeaveStatus(leaveId: string, status: "APPROVED" | "REJECTED", rejectReason?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.leave.update({
      where: { id: leaveId },
      data: { status, approvedBy: session.user.id, rejectReason: status === "REJECTED" ? rejectReason : null }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/absensi-cuti");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
