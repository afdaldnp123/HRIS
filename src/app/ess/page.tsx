import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EssAttendanceTerminal } from "@/components/ess-attendance-terminal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function EssDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { department: true }
  });

  if (!employee) return <div>Data tidak ditemukan</div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayAttendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: today } }
  });

  const monthAttendances = await prisma.attendance.findMany({
    where: { 
      employeeId: employee.id,
      date: { gte: startOfMonth }
    },
    orderBy: { date: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Halo, {employee.fullName.split(' ')[0]}</h1>
          <p className="text-zinc-500 mt-1">Selamat datang di portal informasi pribadi Anda.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-zinc-50 rounded-full z-0"></div>
          <div className="flex items-center gap-5 z-10">
            <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-md">
              {employee.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{employee.fullName}</h3>
              <p className="text-sm font-medium text-zinc-500">{employee.nip}</p>
              <div className="mt-2 inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800 ring-1 ring-inset ring-zinc-500/20">
                {employee.department.name}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Terminal */}
        <EssAttendanceTerminal 
          hasClockedIn={!!todayAttendance?.clockIn} 
          hasClockedOut={!!todayAttendance?.clockOut} 
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
          <h3 className="font-semibold text-sm">Riwayat Absensi Bulan Ini</h3>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Durasi Kerja</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthAttendances.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">Belum ada data absensi bulan ini.</TableCell></TableRow>
              ) : monthAttendances.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-zinc-900">{format(a.date, 'dd MMM yyyy', { locale: id })}</TableCell>
                  <TableCell>{a.clockIn ? format(a.clockIn, 'HH:mm') : '-'}</TableCell>
                  <TableCell>{a.clockOut ? format(a.clockOut, 'HH:mm') : '-'}</TableCell>
                  <TableCell>{a.workMinutes > 0 ? `${Math.floor(a.workMinutes / 60)}j ${a.workMinutes % 60}m` : '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${a.status === 'LATE' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'}`}>
                      {a.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-3 bg-zinc-50/50">
          {monthAttendances.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">Belum ada data absensi bulan ini.</div>
          ) : monthAttendances.map(a => (
            <div key={a.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-900">{format(a.date, 'dd MMM yyyy', { locale: id })}</span>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset shrink-0 ${a.status === 'LATE' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'}`}>
                  {a.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-zinc-50 p-2 rounded border border-zinc-100 flex flex-col items-center">
                  <span className="text-xs text-zinc-500 mb-1">Clock In</span>
                  <span className="font-mono font-medium text-zinc-900">{a.clockIn ? format(a.clockIn, 'HH:mm') : '-'}</span>
                </div>
                <div className="bg-zinc-50 p-2 rounded border border-zinc-100 flex flex-col items-center">
                  <span className="text-xs text-zinc-500 mb-1">Clock Out</span>
                  <span className="font-mono font-medium text-zinc-900">{a.clockOut ? format(a.clockOut, 'HH:mm') : '-'}</span>
                </div>
              </div>
              <div className="text-center text-xs text-zinc-500 pt-1">
                Durasi: <span className="font-medium text-zinc-700">{a.workMinutes > 0 ? `${Math.floor(a.workMinutes / 60)}j ${a.workMinutes % 60}m` : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
