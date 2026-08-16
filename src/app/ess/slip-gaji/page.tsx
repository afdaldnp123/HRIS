import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EssPayslipDownload } from "@/components/ess-payslip-download";

export const dynamic = "force-dynamic";

export default async function EssSlipGajiPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id }
  });

  if (!employee) return <div>Data karyawan tidak ditemukan.</div>;

  const payrollItems = await prisma.payrollItem.findMany({
    where: { employeeId: employee.id, payroll: { status: "PAID" } },
    include: { payroll: true },
    orderBy: { payroll: { createdAt: "desc" } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Riwayat Slip Gaji</h1>
        <p className="text-zinc-500 mt-1">Unduh slip gaji Anda yang telah diterbitkan (Dilindungi oleh konfirmasi NIP).</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Take Home Pay</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                    Belum ada slip gaji yang diterbitkan.
                  </TableCell>
                </TableRow>
              ) : (
                payrollItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-zinc-900">
                      {new Date(0, item.payroll.periodMonth - 1).toLocaleString('id-ID', { month: 'long' })} {item.payroll.periodYear}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-zinc-900 text-lg">Rp {Number(item.netSalary).toLocaleString('id-ID')}</div>
                      <div className="mt-2 text-xs text-zinc-500 space-y-1 bg-zinc-50 p-2 rounded border border-zinc-100 w-fit">
                        <div className="flex gap-4 justify-between">
                          <span>Gaji Pokok:</span>
                          <span className="font-medium">Rp {Number(item.baseSalarySnap).toLocaleString('id-ID')}</span>
                        </div>
                        {Number(item.totalAllowances) > 0 && (
                          <div className="flex gap-4 justify-between text-blue-600">
                            <span>Klaim / Tambahan:</span>
                            <span className="font-medium">+ Rp {Number(item.totalAllowances).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex gap-4 justify-between text-red-600">
                          <span>Potongan (Pajak/BPJS):</span>
                          <span className="font-medium">- Rp {(Number(item.bpjsEmployeeSnap) + Number(item.pph21Snap) + Number(item.totalDeductions)).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top pt-4">
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                        PAID
                      </span>
                    </TableCell>
                    <TableCell className="text-right align-top pt-4">
                      <EssPayslipDownload payrollItemId={item.id} employeeNip={employee.nip} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4 bg-zinc-50/50">
          {payrollItems.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">Belum ada slip gaji yang diterbitkan.</div>
          ) : (
            payrollItems.map((item) => (
              <div key={item.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900">
                      {new Date(0, item.payroll.periodMonth - 1).toLocaleString('id-ID', { month: 'long' })} {item.payroll.periodYear}
                    </h3>
                    <div className="font-bold text-emerald-600 text-lg mt-1">Rp {Number(item.netSalary).toLocaleString('id-ID')}</div>
                  </div>
                  <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                    PAID
                  </span>
                </div>
                
                <div className="text-xs text-zinc-500 space-y-2 bg-zinc-50 p-3 rounded border border-zinc-100">
                  <div className="flex justify-between">
                    <span>Gaji Pokok:</span>
                    <span className="font-medium text-zinc-900">Rp {Number(item.baseSalarySnap).toLocaleString('id-ID')}</span>
                  </div>
                  {Number(item.totalAllowances) > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Klaim / Tambahan:</span>
                      <span className="font-medium">+ Rp {Number(item.totalAllowances).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-red-600">
                    <span>Potongan (Pajak/BPJS):</span>
                    <span className="font-medium">- Rp {(Number(item.bpjsEmployeeSnap) + Number(item.pph21Snap) + Number(item.totalDeductions)).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <EssPayslipDownload payrollItemId={item.id} employeeNip={employee.nip} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
