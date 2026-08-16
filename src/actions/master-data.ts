"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteDepartment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const employeesCount = await prisma.employee.count({ where: { departmentId: id } });
    if (employeesCount > 0) {
      return { success: false, error: `Gagal: Terdapat ${employeesCount} karyawan yang masih terdaftar di departemen ini. Pindahkan mereka terlebih dahulu.` };
    }

    await prisma.department.delete({ where: { id } });
    revalidatePath("/admin/master-data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAllowance(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.allowanceType.delete({ where: { id } });
    revalidatePath("/admin/master-data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDeduction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.deductionType.delete({ where: { id } });
    revalidatePath("/admin/master-data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === CREATE & UPDATE DEPARTEMEN ===
export async function saveDepartment(data: { id?: string, code: string, name: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    if (data.id) {
      await prisma.department.update({ where: { id: data.id }, data: { code: data.code, name: data.name } });
    } else {
      await prisma.department.create({ data: { code: data.code, name: data.name } });
    }
    revalidatePath("/admin/master-data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === CREATE & UPDATE TUNJANGAN ===
export async function saveAllowance(data: { id?: string, name: string, type: any, defaultValue: number, isTaxable: boolean }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    if (data.id) {
      await prisma.allowanceType.update({ where: { id: data.id }, data });
    } else {
      await prisma.allowanceType.create({ data });
    }
    revalidatePath("/admin/master-data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === CREATE & UPDATE POTONGAN ===
export async function saveDeduction(data: { id?: string, name: string, type: any, defaultValue: number }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    if (data.id) {
      await prisma.deductionType.update({ where: { id: data.id }, data });
    } else {
      await prisma.deductionType.create({ data });
    }
    revalidatePath("/admin/master-data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
