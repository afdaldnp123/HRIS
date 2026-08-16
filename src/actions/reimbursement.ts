"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const submitReimbursementSchema = z.object({
  date: z.coerce.date(),
  amount: z.coerce.number().positive("Nominal harus lebih dari Rp 0"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter")
});

export async function submitReimbursement(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYEE") return { success: false, error: "Unauthorized" };

    const employee = await prisma.employee.findUnique({ where: { userId: session.user.id } });
    if (!employee) return { success: false, error: "Employee not found" };

    const parsed = submitReimbursementSchema.safeParse({
      date: formData.get("date"),
      amount: formData.get("amount"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message || "Data tidak valid" };
    }

    const { date, amount, description } = parsed.data;

    let attachmentUrl = null;
    const file = formData.get("attachment") as File | null;
    if (file && file.size > 0) {
      const fs = require("fs/promises");
      const path = require("path");
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const dirPath = path.join(process.cwd(), "public/uploads/reimbursements");
      await fs.mkdir(dirPath, { recursive: true });
      
      const extension = file.name.split('.').pop() || "png";
      const filename = `${employee.nip}-${Date.now()}.${extension}`;
      const filepath = path.join(dirPath, filename);
      
      await fs.writeFile(filepath, buffer);
      attachmentUrl = `/uploads/reimbursements/${filename}`;
    }

    await prisma.reimbursement.create({
      data: {
        employeeId: employee.id,
        date,
        amount,
        description,
        attachmentUrl
      }
    });

    // Notifikasi untuk Admin
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    const notifications = admins.map(admin => ({
      userId: admin.id,
      title: "Pengajuan Klaim Baru",
      message: `${employee.fullName} mengajukan klaim sebesar Rp ${amount.toLocaleString("id-ID")}`
    }));
    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    revalidatePath("/ess/reimbursement");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processReimbursement(reimbursementId: string, status: "APPROVED" | "REJECTED", rejectReason?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const reimbursement = await prisma.reimbursement.update({
      where: { id: reimbursementId },
      data: { 
        status, 
        approvedBy: session.user.id,
        rejectReason: status === "REJECTED" ? rejectReason : null
      },
      include: { employee: true }
    });

    // Notifikasi untuk Karyawan
    await prisma.notification.create({
      data: {
        userId: reimbursement.employee.userId,
        title: `Klaim Biaya ${status === "APPROVED" ? "Disetujui" : "Ditolak"}`,
        message: `Klaim Anda untuk "${reimbursement.description}" sebesar Rp ${Number(reimbursement.amount).toLocaleString("id-ID")} telah ${status === "APPROVED" ? "disetujui" : `ditolak${rejectReason ? ` dengan alasan: ${rejectReason}` : ''}`}.`
      }
    });
    
    revalidatePath("/admin/reimbursement");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processBulkReimbursement(ids: string[], status: "APPROVED" | "REJECTED", rejectReason?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const reimbursements = await prisma.reimbursement.findMany({
      where: { id: { in: ids } },
      include: { employee: true }
    });

    await prisma.reimbursement.updateMany({
      where: { id: { in: ids } },
      data: { 
        status, 
        approvedBy: session.user.id,
        rejectReason: status === "REJECTED" ? rejectReason : null
      }
    });

    const notifications = reimbursements.map(r => ({
      userId: r.employee.userId,
      title: `Klaim Biaya ${status === "APPROVED" ? "Disetujui" : "Ditolak"} (Massal)`,
      message: `Klaim Anda untuk "${r.description}" sebesar Rp ${Number(r.amount).toLocaleString("id-ID")} telah ${status === "APPROVED" ? "disetujui" : `ditolak${rejectReason ? ` dengan alasan: ${rejectReason}` : ''}`}.`
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    revalidatePath("/admin/reimbursement");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
