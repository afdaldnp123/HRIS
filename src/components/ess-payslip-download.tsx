"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";

export function EssPayslipDownload({ payrollItemId, employeeNip }: { payrollItemId: string, employeeNip: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nipInput, setNipInput] = useState("");
  const [error, setError] = useState("");

  const handleDownload = () => {
    if (nipInput === employeeNip) {
      setIsOpen(false);
      setNipInput("");
      setError("");
      // Proceed to download
      window.open(`/api/payroll/${payrollItemId}/pdf`, "_blank");
    } else {
      setError("NIP yang Anda masukkan tidak sesuai.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Unduh PDF</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Konfirmasi Keamanan
          </DialogTitle>
          <DialogDescription>
            Dokumen ini bersifat rahasia. Masukkan NIP Anda untuk mengunduh slip gaji.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input 
            placeholder="Masukkan NIP Anda (Contoh: EMP20260001)" 
            value={nipInput}
            onChange={(e) => {
              setNipInput(e.target.value);
              setError("");
            }}
            type="password"
            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button onClick={handleDownload} className="bg-zinc-900 text-white hover:bg-zinc-800">Buka Dokumen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
