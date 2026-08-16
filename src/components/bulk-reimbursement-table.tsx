"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AdminReimbursementActions } from "./admin-reimbursement-actions";
import { processBulkReimbursement } from "@/actions/reimbursement";
import { Button } from "./ui/button";
import { CheckSquare, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function BulkReimbursementTable({ reimbursements }: { reimbursements: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reimbursements.filter(r => r.status === "PENDING").map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = async (status: "APPROVED" | "REJECTED", reason?: string) => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    const res = await processBulkReimbursement(selectedIds, status, reason);
    if (res.success) {
      setSelectedIds([]);
      setIsRejectDialogOpen(false);
      setRejectReason("");
      toast.success("Berhasil", {
        description: `Klaim massal berhasil di${status === "APPROVED" ? "setujui" : "tolak"}.`,
      });
    } else {
      toast.error("Gagal", {
        description: res.error || "Terjadi kesalahan.",
      });
    }
    setIsProcessing(false);
  };

  const pendingCount = reimbursements.filter(r => r.status === "PENDING").length;
  const isAllSelected = pendingCount > 0 && selectedIds.length === pendingCount;

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-zinc-900 text-white p-3 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-zinc-400" />
            <span className="font-medium text-sm">{selectedIds.length} pengajuan dipilih</span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="h-8 border-transparent bg-white/10 hover:bg-white/20 text-white" onClick={() => handleBulkAction("APPROVED")} disabled={isProcessing}>
              <Check className="w-4 h-4 mr-1" /> Setujui
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-transparent bg-white/10 hover:bg-red-500/80 text-white" onClick={() => setIsRejectDialogOpen(true)} disabled={isProcessing}>
              <X className="w-4 h-4 mr-1" /> Tolak
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak {selectedIds.length} Klaim Secara Massal</DialogTitle>
            <DialogDescription>
              Silakan masukkan alasan penolakan. Catatan ini akan dikirimkan kepada seluruh karyawan yang dipilih.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Contoh: Dokumen kurang lengkap..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-4"
            rows={4}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleBulkAction("REJECTED", rejectReason)}
              disabled={isProcessing || rejectReason.trim().length === 0}
            >
              Konfirmasi Penolakan Massal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={pendingCount === 0 || isProcessing}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Karyawan</th>
                <th className="px-6 py-4 font-medium">Deskripsi</th>
                <th className="px-6 py-4 font-medium">Nominal</th>
                <th className="px-6 py-4 font-medium">Bukti</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reimbursements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                    Belum ada data pengajuan klaim.
                  </td>
                </tr>
              ) : (
                reimbursements.map((r) => (
                  <tr key={r.id} className={`border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors ${selectedIds.includes(r.id) ? 'bg-zinc-50/80' : ''}`}>
                    <td className="px-6 py-4">
                      {r.status === "PENDING" ? (
                        <input 
                          type="checkbox"
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                          checked={selectedIds.includes(r.id)}
                          onChange={() => handleSelect(r.id)}
                          disabled={isProcessing}
                        />
                      ) : (
                        <input type="checkbox" disabled className="rounded border-zinc-200 opacity-50 cursor-not-allowed" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(r.date), "dd MMM yyyy")}</td>
                    <td className="px-6 py-4 text-zinc-900 font-medium">
                      {r.employee.fullName} <span className="block text-xs font-normal text-zinc-500">{r.employee.nip}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{r.description}</td>
                    <td className="px-6 py-4 font-mono font-medium whitespace-nowrap">Rp {Number(r.amount).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {r.attachmentUrl ? (
                        <a href={r.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">Lihat Struk</a>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">Tanpa struk</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        r.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        r.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {r.status === "PENDING" ? (
                        <AdminReimbursementActions id={r.id} />
                      ) : (
                        <span className="text-zinc-400 text-sm">-</span>
                      )}
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
