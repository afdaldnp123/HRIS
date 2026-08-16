import prisma from "@/lib/prisma";
import { LeaveActionButtons } from "@/components/leave-action-buttons";
import { DashboardExpenseCard } from "@/components/dashboard-expense-card";
import { Users, Clock, CalendarDays, Wallet } from "lucide-react";

export default async function AdminDashboard() {
  const totalKaryawan = await prisma.employee.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const hadirHariIni = await prisma.attendance.count({
    where: {
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const pendingCuti = await prisma.leave.count({
    where: { status: "PENDING" }
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const payrollBulanIni = await prisma.payroll.findFirst({
    where: { periodMonth: currentMonth, periodYear: currentYear },
    include: { items: true }
  });

  let totalPengeluaran = 0;
  if (payrollBulanIni) {
    totalPengeluaran = payrollBulanIni.items.reduce((acc, item) => acc + Number(item.netSalary), 0);
  }

  const pendingLeavesList = await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Calculate this week's attendance for the minimalist chart
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekAttendances = await prisma.attendance.findMany({
    where: {
      date: { gte: startOfWeek }
    }
  });

  const totalThisWeek = thisWeekAttendances.length;
  const lateThisWeek = thisWeekAttendances.filter(a => a.status === "LATE").length;
  const onTimeThisWeek = totalThisWeek - lateThisWeek;

  const onTimePercentage = totalThisWeek > 0 ? (onTimeThisWeek / totalThisWeek) * 100 : 0;
  const latePercentage = totalThisWeek > 0 ? (lateThisWeek / totalThisWeek) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard Utama</h1>
        <p className="text-zinc-500 mt-1">Ringkasan operasional SDM dan penggajian.</p>
      </div>
      
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Users className="w-4 h-4" />
            <h3 className="text-sm font-medium">Total Karyawan</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{totalKaryawan}</p>
        </div>
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-medium">Hadir Hari Ini</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{hadirHariIni}</p>
        </div>
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <CalendarDays className="w-4 h-4" />
            <h3 className="text-sm font-medium">Pending Cuti</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{pendingCuti}</p>
        </div>
        <DashboardExpenseCard totalPengeluaran={totalPengeluaran} />
      </div>

      {/* Chart & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Minimalist Chart */}
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-zinc-900 mb-6">Presisi Absensi (Minggu Ini)</h3>
          
          <div className="space-y-4 flex-1 justify-center flex flex-col">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 font-medium">Tepat Waktu ({onTimePercentage.toFixed(0)}%)</span>
              <span className="text-zinc-900 font-bold">{onTimeThisWeek} Orang</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${onTimePercentage}%` }} />
            </div>

            <div className="flex items-center justify-between text-sm mt-6">
              <span className="text-zinc-600 font-medium">Terlambat ({latePercentage.toFixed(0)}%)</span>
              <span className="text-zinc-900 font-bold">{lateThisWeek} Orang</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${latePercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Leave Actions */}
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Pengajuan Cuti Terbaru</h3>
          {pendingLeavesList.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-zinc-500 italic bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
              Tidak ada pengajuan cuti yang tertunda.
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {pendingLeavesList.map(leave => (
                <div key={leave.id} className="flex items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{leave.employee.fullName}</p>
                    <p className="text-xs text-zinc-500 mt-1">{leave.reason} ({leave.startDate.toLocaleDateString('id-ID')} - {leave.endDate.toLocaleDateString('id-ID')})</p>
                  </div>
                  <LeaveActionButtons leaveId={leave.id} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
