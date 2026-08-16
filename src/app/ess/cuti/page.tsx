import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EssLeaveForm } from "@/components/ess-leave-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpandableText } from "@/components/expandable-text";

export const dynamic = "force-dynamic";

export default async function CutiPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id }
  });

  if (!employee) return <div>Data karyawan tidak ditemukan.</div>;

  const leaves = await prisma.leave.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" }
  });

  const currentYear = new Date().getFullYear();
  // Hitung cuti yang APPROVED dan PENDING di tahun ini
  const activeLeaves = leaves.filter(l => 
    (l.status === "APPROVED" || l.status === "PENDING") && 
    l.startDate.getFullYear() === currentYear
  );

  function getBusinessDays(startDate: Date, endDate: Date) {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }

  const usedLeaves = activeLeaves.reduce((total, l) => total + getBusinessDays(l.startDate, l.endDate), 0);
  const remainingLeaves = Math.max(0, 12 - usedLeaves);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pengajuan Cuti</h1>
        <p className="text-zinc-500 mt-1">Isi formulir untuk mengajukan izin tidak masuk kerja.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-zinc-200 h-fit">
          <CardHeader>
            <CardTitle>Formulir Cuti Baru</CardTitle>
            <CardDescription>Cuti yang diajukan memerlukan persetujuan dari HR.</CardDescription>
          </CardHeader>
          <CardContent>
            <EssLeaveForm remainingLeaves={remainingLeaves} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle>Riwayat Pengajuan</CardTitle>
            <CardDescription>Status pengajuan cuti Anda sebelumnya.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rentang Tanggal</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[200px]">Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {leaves.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-500">Belum ada data cuti.</TableCell></TableRow>
                  ) : leaves.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div>
                          {format(l.startDate, 'dd MMM', { locale: id })} - {format(l.endDate, 'dd MMM yyyy', { locale: id })}
                        </div>
                        <div className="text-xs text-zinc-500 font-normal mt-0.5">
                          {getBusinessDays(l.startDate, l.endDate)} Hari Kerja
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={l.reason}>{l.reason}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {leaves.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-sm">Belum ada data cuti.</div>
              ) : leaves.map(l => (
                <div key={l.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-zinc-900 line-clamp-1">{l.reason}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {format(l.startDate, 'dd MMM', { locale: id })} - {format(l.endDate, 'dd MMM yyyy', { locale: id })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset shrink-0 ${
                      l.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : 
                      l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-zinc-50 p-2 rounded border border-zinc-100">
                    <span className="text-xs text-zinc-500 font-medium">Durasi</span>
                    <span className="font-medium text-sm text-zinc-900">{getBusinessDays(l.startDate, l.endDate)} Hari Kerja</span>
                  </div>

                  {l.rejectReason && (
                    <div className="mt-1">
                      <span className="text-xs text-zinc-500 font-medium block mb-1">Catatan Admin:</span>
                      <div className="text-xs text-zinc-700 bg-red-50 p-2 rounded border border-red-100">
                        <ExpandableText text={l.rejectReason} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
