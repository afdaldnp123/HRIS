"use client";

import { useState, useEffect } from "react";
import { submitLeave } from "@/actions/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getBusinessDays(startDate: Date, endDate: Date) {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

export function EssLeaveForm({ remainingLeaves = 12 }: { remainingLeaves?: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [businessDays, setBusinessDays] = useState(0);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        setBusinessDays(getBusinessDays(start, end));
      } else {
        setBusinessDays(0);
      }
    } else {
      setBusinessDays(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (businessDays > remainingLeaves) {
      setMessage(`Gagal mengajukan cuti. Kuota cuti Anda (${remainingLeaves} hari) tidak mencukupi untuk pengajuan ini (${businessDays} hari).`);
      return;
    }

    setIsLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      reason: formData.get("reason") as string,
    };

    const res = await submitLeave(data);
    if (res.success) {
      setMessage("Pengajuan cuti berhasil dikirim.");
      setStartDate("");
      setEndDate("");
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage(res.error || "Gagal mengajukan cuti.");
    }
    setIsLoading(false);
  };

  return (
    <div>
      {message && (
        <div className={`mb-6 p-3 rounded text-sm font-medium ${message.includes('Gagal') ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-800'}`}>
          {message}
        </div>
      )}
      <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <span className="text-sm font-medium text-blue-800">Sisa Kuota Cuti Tahunan:</span>
        <span className="text-lg font-bold text-blue-900">{remainingLeaves} Hari</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Mulai Tanggal</Label>
            <Input 
              id="startDate" 
              name="startDate" 
              type="date" 
              required 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Sampai Tanggal</Label>
            <Input 
              id="endDate" 
              name="endDate" 
              type="date" 
              required 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        {businessDays > 0 && (
          <div className="text-sm font-medium text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-200">
            Total Pengajuan: <span className="font-bold text-zinc-900">{businessDays} Hari Kerja</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Alasan Cuti / Izin</Label>
          <Input id="reason" name="reason" placeholder="Acara keluarga, sakit, dll..." required />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Mengirim..." : "Ajukan Cuti"}
        </Button>
      </form>
    </div>
  );
}
