import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;

  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Audit Trail (Log Aktivitas)</h1>
        <p className="text-zinc-500 mt-1">Pantau setiap perubahan krusial pada sistem untuk keamanan dan kepatuhan ISO 27001.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
                <th className="px-6 py-4 font-medium">Entitas</th>
                <th className="px-6 py-4 font-medium">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Belum ada log aktivitas. Sistem mulai mencatat sejak audit diaktifkan.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}</td>
                    <td className="px-6 py-4 text-zinc-900 font-medium">
                      {log.user ? log.user.email : "Sistem"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        log.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-blue-50 text-blue-700 ring-blue-600/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-600">{log.entity} <span className="text-xs text-zinc-400">({log.entityId})</span></td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                      {log.oldValues && <div className="text-red-600 mb-1">Old: {JSON.stringify(log.oldValues).substring(0,50)}...</div>}
                      {log.newValues && <div className="text-green-600">New: {JSON.stringify(log.newValues).substring(0,50)}...</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
