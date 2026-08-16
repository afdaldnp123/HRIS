import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const attendances = await prisma.attendance.findMany({
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 1000 // Batasi untuk performa
  });

  const csvRows = [
    ["Tanggal", "NIP", "Nama", "Clock In", "Clock Out", "Status", "Durasi (Menit)"]
  ];

  attendances.forEach(a => {
    csvRows.push([
      format(a.date, 'yyyy-MM-dd'),
      a.employee.nip,
      `"${a.employee.fullName}"`, // Hindari masalah koma pada nama
      a.clockIn ? format(a.clockIn, 'HH:mm:ss') : '-',
      a.clockOut ? format(a.clockOut, 'HH:mm:ss') : '-',
      a.status,
      a.workMinutes.toString()
    ]);
  });

  const csvString = csvRows.map(row => row.join(",")).join("\n");

  return new NextResponse(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="Laporan_Absensi_${format(new Date(), 'yyyyMMdd')}.csv"`
    }
  });
}
