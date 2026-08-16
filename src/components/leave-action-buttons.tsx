"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateLeaveStatus } from "@/actions/leave";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function LeaveActionButtons({ leaveId }: { leaveId: string }) {
  const [loading, setLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function handleAction(status: "APPROVED" | "REJECTED", reason?: string) {
    setLoading(true);
    const result = await updateLeaveStatus(leaveId, status, reason);
    setLoading(false);
    
    if (result.success) {
      setIsRejectDialogOpen(false);
      setRejectReason("");
      toast.success("Berhasil", {
        description: `Pengajuan cuti berhasil di${status === "APPROVED" ? "setujui" : "tolak"}.`,
      });
    } else {
      toast.error("Gagal", {
        description: result.error || "Terjadi kesalahan.",
      });
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
          onClick={() => handleAction("APPROVED")}
          disabled={loading}
        >
          <Check className="w-4 h-4" /> 
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
          onClick={() => setIsRejectDialogOpen(true)}
          disabled={loading}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
            <DialogDescription>
              Silakan masukkan alasan penolakan (opsional namun disarankan). Catatan ini akan dikirimkan kepada karyawan yang bersangkutan.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Contoh: Sedang ada project penting bulan ini..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-4"
            rows={4}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction("REJECTED", rejectReason)}
              disabled={loading || rejectReason.trim().length === 0}
            >
              Konfirmasi Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
