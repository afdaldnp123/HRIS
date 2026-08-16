"use client";

import { useState } from "react";
import { processReimbursement } from "@/actions/reimbursement";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AdminReimbursementActions({ id }: { id: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleProcess = async (status: "APPROVED" | "REJECTED", reason?: string) => {
    setIsProcessing(true);
    const result = await processReimbursement(id, status, reason);
    setIsProcessing(false);
    
    if (result.success) {
      setIsRejectDialogOpen(false);
      setRejectReason("");
      toast.success("Berhasil", {
        description: `Klaim berhasil di${status === "APPROVED" ? "setujui" : "tolak"}.`,
      });
    } else {
      toast.error("Gagal", {
        description: result.error || "Terjadi kesalahan.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
          onClick={() => handleProcess("APPROVED")}
          disabled={isProcessing}
        >
          <Check className="w-4 h-4 mr-1" /> Setujui
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          onClick={() => setIsRejectDialogOpen(true)}
          disabled={isProcessing}
        >
          <X className="w-4 h-4 mr-1" /> Tolak
        </Button>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Klaim Biaya</DialogTitle>
            <DialogDescription>
              Silakan masukkan alasan penolakan. Catatan ini akan dikirimkan kepada karyawan yang bersangkutan.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Contoh: Struk tidak terbaca / Nominal melebihi batas..."
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
              onClick={() => handleProcess("REJECTED", rejectReason)}
              disabled={isProcessing || rejectReason.trim().length === 0}
            >
              Konfirmasi Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
