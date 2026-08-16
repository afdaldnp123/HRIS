"use client";

import { useState } from "react";
import { generateDraftPayroll, updatePayrollStatus, deleteDraftPayroll } from "@/actions/payroll";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { PayrollStatus } from "@prisma/client";

export function AdminPayrollGenerateButton() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    setIsProcessing(true);
    const d = new Date();
    const result = await generateDraftPayroll(d.getMonth() + 1, d.getFullYear());
    
    if (result.success) {
      toast.success("Berhasil", {
        description: `Draft Payroll bulan ini berhasil digenerate.`,
      });
    } else {
      toast.error("Gagal", {
        description: result.error || "Terjadi kesalahan.",
      });
    }
    setIsProcessing(false);
  };

  return (
    <Button onClick={handleGenerate} disabled={isProcessing} className="bg-zinc-900 text-white hover:bg-zinc-800">
      {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Generate Draft Bulan Ini
    </Button>
  );
}

export function AdminPayrollStatusButton({ payrollId, currentStatus }: { payrollId: string, currentStatus: PayrollStatus }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    
    let nextStatus: PayrollStatus | null = null;
    if (currentStatus === "DRAFT") nextStatus = "IN_REVIEW";
    else if (currentStatus === "IN_REVIEW") nextStatus = "APPROVED";
    else if (currentStatus === "APPROVED") nextStatus = "PAID";

    if (nextStatus) {
      const result = await updatePayrollStatus(payrollId, nextStatus);
      if (result.success) {
        toast.success("Berhasil", {
          description: `Status payroll berhasil diubah.`,
        });
      } else {
        toast.error("Gagal", {
          description: result.error || "Terjadi kesalahan.",
        });
      }
    }
    
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus draft ini? Anda harus melakukan generate ulang nanti.")) return;
    
    setIsProcessing(true);
    const result = await deleteDraftPayroll(payrollId);
    if (result.success) {
      toast.success("Berhasil", {
        description: `Draft payroll berhasil dihapus.`,
      });
    } else {
      toast.error("Gagal", {
        description: result.error || "Terjadi kesalahan.",
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {currentStatus === 'DRAFT' && (
        <>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete} disabled={isProcessing} title="Hapus Draft">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={handleProcess} disabled={isProcessing}>
            {isProcessing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
            Review & Kirim
          </Button>
        </>
      )}
      {currentStatus === 'IN_REVIEW' && (
        <Button variant="default" size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleProcess} disabled={isProcessing}>
          {isProcessing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
          Approve Data
        </Button>
      )}
      {(currentStatus === 'APPROVED' || currentStatus === 'PAID') && (
        <Button variant="default" size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white" onClick={handleProcess} disabled={isProcessing || currentStatus === 'PAID'}>
          {isProcessing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
          Cetak & Bayar
        </Button>
      )}
    </div>
  );
}
