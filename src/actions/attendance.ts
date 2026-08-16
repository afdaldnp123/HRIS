"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AttendanceStatus } from "@prisma/client";

export async function clockIn() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { success: false, error: "Unauthorized" };

    const employee = await prisma.employee.findUnique({ where: { userId: session.user.id } });
    if (!employee) return { success: false, error: "Karyawan tidak ditemukan" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      }
    });

    if (existing?.clockIn) {
      return { success: false, error: "Anda sudah melakukan Clock In hari ini" };
    }

    const now = new Date();
    // Logic untuk telat (misalnya di atas jam 9)
    const status = now.getHours() >= 9 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { clockIn: now, status }
      });
    } else {
      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: today,
          clockIn: now,
          status
        }
      });
    }

    revalidatePath("/ess", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clockOut() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { success: false, error: "Unauthorized" };

    const employee = await prisma.employee.findUnique({ where: { userId: session.user.id } });
    if (!employee) return { success: false, error: "Karyawan tidak ditemukan" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      }
    });

    if (!existing || !existing.clockIn) {
      return { success: false, error: "Anda belum Clock In hari ini" };
    }
    if (existing.clockOut) {
      return { success: false, error: "Anda sudah melakukan Clock Out hari ini" };
    }

    const now = new Date();
    const workMinutes = Math.floor((now.getTime() - existing.clockIn.getTime()) / 60000);

    await prisma.attendance.update({
      where: { id: existing.id },
      data: { 
        clockOut: now,
        workMinutes
      }
    });

    revalidatePath("/ess", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
