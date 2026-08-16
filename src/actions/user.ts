"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function changePassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { success: false, error: "Unauthorized" };

    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "Semua field harus diisi." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Kata sandi baru dan konfirmasi tidak cocok." };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "Kata sandi baru minimal 8 karakter." };
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: "User tidak ditemukan." };

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) return { success: false, error: "Kata sandi lama tidak sesuai." };

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
