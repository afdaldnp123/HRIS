"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encryptData } from "@/lib/encryption";
import { revalidatePath } from "next/cache";
import { EmploymentStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createEmployee(data: {
  email: string;
  nip: string;
  fullName: string;
  phone?: string;
  departmentId: string;
  joinDate: string;
  status: string;
  baseSalary: string;
  bankName?: string;
  bankAccountNumber?: string;
  ptkpCode: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) return { success: false, error: "Email sudah terdaftar" };

    const existingNip = await prisma.employee.findUnique({ where: { nip: data.nip } });
    if (existingNip) return { success: false, error: "NIP sudah terdaftar" };

    const passwordHash = await bcrypt.hash("Password123!", 10);

    const encryptedBaseSalary = encryptData(data.baseSalary.toString());
    const encryptedBankAccount = data.bankAccountNumber ? encryptData(data.bankAccountNumber) : null;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: Role.EMPLOYEE,
        }
      });

      await tx.employee.create({
        data: {
          userId: user.id,
          departmentId: data.departmentId,
          nip: data.nip,
          fullName: data.fullName,
          phone: data.phone,
          joinDate: new Date(data.joinDate),
          status: data.status as EmploymentStatus,
          baseSalary: encryptedBaseSalary,
          bankName: data.bankName,
          bankAccountNumber: encryptedBankAccount,
          ptkpCode: data.ptkpCode,
        }
      });
    });

    revalidatePath("/admin/karyawan");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return { success: false, error: error.message || "Terjadi kesalahan server" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return { success: false, error: "Karyawan tidak ditemukan" };
    }

    // Delete User, which will cascade delete Employee and all related data
    await prisma.user.delete({
      where: { id: employee.userId }
    });

    revalidatePath("/admin/karyawan");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Gagal menghapus karyawan. Pastikan data terkait sudah ditangani." };
  }
}

export async function updateEmployee(data: {
  id?: string;
  email: string;
  nip: string;
  fullName: string;
  phone?: string;
  departmentId: string;
  joinDate: string;
  status: string;
  baseSalary: string;
  bankName?: string;
  bankAccountNumber?: string;
  ptkpCode: string;
}) {
  try {
    if (!data.id) return { success: false, error: "ID Karyawan tidak ditemukan" };
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const employee = await prisma.employee.findUnique({ where: { id: data.id } });
    if (!employee) return { success: false, error: "Data karyawan tidak ditemukan" };

    const encryptedBaseSalary = encryptData(data.baseSalary.toString());
    const encryptedBankAccount = data.bankAccountNumber ? encryptData(data.bankAccountNumber) : null;

    await prisma.$transaction(async (tx) => {
      // Perbarui employee
      await tx.employee.update({
        where: { id: data.id },
        data: {
          departmentId: data.departmentId,
          fullName: data.fullName,
          phone: data.phone,
          joinDate: new Date(data.joinDate),
          status: data.status as EmploymentStatus,
          baseSalary: encryptedBaseSalary,
          bankName: data.bankName,
          bankAccountNumber: encryptedBankAccount,
          ptkpCode: data.ptkpCode,
        }
      });
      // Email tidak dapat diubah di sini (atau buat logika terpisah untuk ubah email user jika perlu)
    });

    revalidatePath("/admin/karyawan");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return { success: false, error: error.message || "Terjadi kesalahan server" };
  }
}
