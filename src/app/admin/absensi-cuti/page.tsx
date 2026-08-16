import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaveActionButtons } from "@/components/leave-action-buttons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandableText } from "@/components/expandable-text";

export const dynamic = "force-dynamic";

export default async function AbsensiCutiAdminPage() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: { employee: true },
    orderBy: { clockIn: 'desc' }
  });

  const leaves = await prisma.leave.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Absensi & Cuti</h1>
        <p className="text-zinc-500 mt-1">Rekapitulasi kehadiran harian dan persetujuan cuti karyawan.</p>
      </div>
      
      <Tabs defaultValue="absensi" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="absensi">Log Presensi Harian</TabsTrigger>
          <TabsTrigger value="cuti">Manajemen Cuti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="absensi" className="mt-6">
           <div className="flex justify-end mb-4">
             <a href="/api/export/absensi" download>
               <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> Unduh Laporan CSV</Button>
             </a>
           </div>
           <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h3 className="font-semibold text-sm">Data Kehadiran Hari Ini ({format(today, 'dd MMMM yyyy', { locale: id })})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">Tidak ada log presensi hari ini.</TableCell></TableRow>
                ) : attendances.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.employee.nip}</TableCell>
                    <TableCell>{a.employee.fullName}</TableCell>
                    <TableCell>{a.clockIn ? format(a.clockIn, 'HH:mm') : '-'}</TableCell>
                    <TableCell>{a.clockOut ? format(a.clockOut, 'HH:mm') : '-'}</TableCell>
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
        </TabsContent>
        
        <TabsContent value="cuti" className="mt-6">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Tanggal Cuti</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Catatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {leaves.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">Belum ada data cuti.</TableCell></TableRow>
                ) : leaves.map(l => {
                  let usedLeaves = 0;
                  let cur = new Date(l.startDate.getTime());
                  while (cur <= l.endDate) {
                    if (cur.getDay() !== 0 && cur.getDay() !== 6) usedLeaves++;
                    cur.setDate(cur.getDate() + 1);
                  }
                  return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.employee.fullName}</TableCell>
                    <TableCell>
                      <div>{format(l.startDate, 'dd MMM yyyy', { locale: id })} - {format(l.endDate, 'dd MMM yyyy', { locale: id })}</div>
                      <div className="text-xs text-zinc-500 font-normal mt-0.5">{usedLeaves} Hari Kerja</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={l.reason}>{l.reason}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                        l.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : 
                        l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                      }`}>
                        {l.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 w-[200px] min-w-[150px] max-w-[250px]">
                      <ExpandableText text={l.rejectReason || ""} />
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status === 'PENDING' ? (
                        <div className="flex justify-end"><LeaveActionButtons leaveId={l.id} /></div>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
