import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollStatus } from "@prisma/client";
import { PayrollFilters } from "@/components/payroll-filters";
import { AdminPayrollGenerateButton, AdminPayrollStatusButton } from "@/components/admin-payroll-buttons";

export const dynamic = "force-dynamic";

function getBadgeColor(status: string) {
  switch (status) {
    case 'DRAFT': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
    case 'IN_REVIEW': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    case 'APPROVED': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'PAID': return 'bg-green-700 text-white ring-green-700';
    default: return 'bg-zinc-50 text-zinc-700 ring-zinc-600/20';
  }
}

export default async function AdminPayrollPage(props: { searchParams: Promise<{ m?: string, y?: string }> }) {
  const searchParams = await props.searchParams;
  const m = searchParams?.m ? parseInt(searchParams.m) : undefined;
  const y = searchParams?.y ? parseInt(searchParams.y) : undefined;

  const whereCondition: any = {};
  if (m && !isNaN(m)) whereCondition.periodMonth = m;
  if (y && !isNaN(y)) whereCondition.periodYear = y;

  const payrolls = await prisma.payroll.findMany({
    where: whereCondition,
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Manajemen Payroll</h1>
          <p className="text-zinc-500 mt-1">Sistem kalkulasi penggajian, BPJS, dan PPh 21.</p>
        </div>
        <div className="flex items-center gap-3">
          <PayrollFilters />
          <AdminPayrollGenerateButton />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periode</TableHead>
              <TableHead>Total Karyawan</TableHead>
              <TableHead>Total Gross</TableHead>
              <TableHead>Total PPh 21</TableHead>
              <TableHead>Total Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  Belum ada data payroll untuk periode ini.
                </TableCell>
              </TableRow>
            ) : (
              payrolls.map((p) => {
                const totalKaryawan = p.items.length;
                const totalGross = p.items.reduce((acc, i) => acc + Number(i.baseSalarySnap) + Number(i.totalAllowances), 0);
                const totalTax = p.items.reduce((acc, i) => acc + Number(i.pph21Snap), 0);
                const totalNet = Number(p.totalDisbursed);

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-zinc-900">
                       {new Date(0, p.periodMonth - 1).toLocaleString('id-ID', { month: 'long' })} {p.periodYear}
                    </TableCell>
                    <TableCell>{totalKaryawan} Orang</TableCell>
                    <TableCell>Rp {totalGross.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {totalTax.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-semibold text-zinc-900">Rp {totalNet.toLocaleString('id-ID')}</TableCell>
                    
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${getBadgeColor(p.status)}`}>
                        {p.status}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <AdminPayrollStatusButton payrollId={p.id} currentStatus={p.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
