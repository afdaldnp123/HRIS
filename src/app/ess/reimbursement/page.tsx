import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EssReimbursementForm } from "@/components/ess-reimbursement-form";
import { ExpandableText } from "@/components/expandable-text";

export const dynamic = "force-dynamic";

export default async function EssReimbursementPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id }
  });

  if (!employee) return <div>Akses Ditolak</div>;

  const reimbursements = await prisma.reimbursement.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Klaim Biaya (Reimbursement)</h1>
        <p className="text-zinc-500 mt-1">Ajukan klaim pengeluaran bisnis dan pantau status persetujuannya.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Formulir Pengajuan</CardTitle>
            </CardHeader>
            <CardContent>
              <EssReimbursementForm />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Riwayat Klaim</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Deskripsi</th>
                      <th className="px-4 py-3 font-medium">Nominal</th>
                      <th className="px-4 py-3 font-medium">Bukti</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium w-[200px]">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reimbursements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                          Belum ada pengajuan klaim.
                        </td>
                      </tr>
                    ) : (
                      reimbursements.map((r) => (
                        <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                          <td className="px-4 py-3">{format(new Date(r.date), "dd MMM yyyy")}</td>
                          <td className="px-4 py-3 text-zinc-900 font-medium">{r.description}</td>
                          <td className="px-4 py-3 font-mono">Rp {Number(r.amount).toLocaleString("id-ID")}</td>
                          <td className="px-4 py-3">
                            {r.attachmentUrl ? (
                              <a href={r.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">Lihat</a>
                            ) : (
                              <span className="text-zinc-400 text-xs italic">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              r.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                              r.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                              r.status === 'PAID' ? 'bg-zinc-800 text-white ring-zinc-800' :
                              'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 w-[200px] min-w-[150px] max-w-[250px]">
                            <ExpandableText text={r.rejectReason || ""} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {reimbursements.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-sm">Belum ada pengajuan klaim.</div>
                ) : (
                  reimbursements.map((r) => (
                    <div key={r.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-zinc-900">{r.description}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{format(new Date(r.date), "dd MMM yyyy")}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset shrink-0 ${
                          r.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          r.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                          r.status === 'PAID' ? 'bg-zinc-800 text-white ring-zinc-800' :
                          'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-zinc-50 p-2 rounded border border-zinc-100">
                        <span className="text-xs text-zinc-500 font-medium">Nominal</span>
                        <span className="font-mono text-sm font-semibold text-zinc-900">Rp {Number(r.amount).toLocaleString("id-ID")}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500 font-medium">Bukti</span>
                        {r.attachmentUrl ? (
                          <a href={r.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-medium">Lihat Struk</a>
                        ) : (
                          <span className="text-zinc-400 text-xs italic">Tanpa struk</span>
                        )}
                      </div>
                      
                      {r.rejectReason && (
                        <div className="mt-1">
                          <span className="text-xs text-zinc-500 font-medium block mb-1">Catatan Admin:</span>
                          <div className="text-xs text-zinc-700 bg-red-50 p-2 rounded border border-red-100">
                            <ExpandableText text={r.rejectReason} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
