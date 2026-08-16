import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BulkReimbursementTable } from "@/components/bulk-reimbursement-table";

export const dynamic = "force-dynamic";

export default async function AdminReimbursementPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;

  const rawReimbursements = await prisma.reimbursement.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" }
  });

  const reimbursements = rawReimbursements.map(r => ({
    ...r,
    amount: r.amount.toNumber()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Approval Klaim Biaya</h1>
        <p className="text-zinc-500 mt-1">Tinjau dan setujui klaim pengeluaran dari karyawan.</p>
      </div>

      <BulkReimbursementTable reimbursements={reimbursements} />
    </div>
  );
}
