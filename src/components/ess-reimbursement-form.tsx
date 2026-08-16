"use client";

import { useState } from "react";
import { submitReimbursement } from "@/actions/reimbursement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EssReimbursementForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const res = await submitReimbursement(formData);

    if (res.success) {
      setMessage("Pengajuan berhasil dikirim.");
      setIsError(false);
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage(res.error || "Gagal mengirim pengajuan.");
      setIsError(true);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm font-medium ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="date">Tanggal Pengeluaran</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi (Contoh: Tiket Pesawat)</Label>
        <Input id="description" name="description" type="text" placeholder="Detail pengeluaran..." required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Nominal (Rp)</Label>
        <Input id="amount" name="amount" type="number" min="1" placeholder="500000" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="attachment">Bukti Struk (Foto/PDF)</Label>
        <input 
          id="attachment" 
          name="attachment" 
          type="file" 
          accept="image/*,application/pdf" 
          required 
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 shadow-sm transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
        {isLoading ? "Mengirim..." : "Ajukan Klaim"}
      </Button>
    </form>
  );
}
