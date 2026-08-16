"use client";

import { useState, useEffect } from "react";
import { clockIn, clockOut } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

type TerminalProps = {
  hasClockedIn: boolean;
  hasClockedOut: boolean;
};

export function EssAttendanceTerminal({ hasClockedIn, hasClockedOut }: TerminalProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    setIsLoading(true);
    await clockIn();
    setIsLoading(false);
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    await clockOut();
    setIsLoading(false);
  };

  const isDone = hasClockedIn && hasClockedOut;

  return (
    <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col justify-center items-center gap-2 relative overflow-hidden">
      <div className="absolute -top-4 -right-4 p-4 opacity-5 pointer-events-none">
        <Clock className="w-40 h-40" />
      </div>
      
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest z-10">Terminal Absensi</div>
      <div className="text-4xl sm:text-5xl font-mono font-light tracking-tight text-zinc-900 z-10 my-1">
        {time ? time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
      </div>
      
      <div className="flex gap-3 z-10 w-full mt-4">
        <Button 
          onClick={handleClockIn} 
          disabled={hasClockedIn || isLoading || isDone} 
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50 h-10"
        >
          {hasClockedIn ? "Sudah Clock In" : "Clock In Sekarang"}
        </Button>
        <Button 
          onClick={handleClockOut} 
          disabled={!hasClockedIn || hasClockedOut || isLoading} 
          variant={(!hasClockedIn || hasClockedOut) ? "outline" : "destructive"}
          className="flex-1 h-10"
        >
          {hasClockedOut ? "Sudah Clock Out" : "Clock Out"}
        </Button>
      </div>

      {isDone && (
        <p className="text-xs font-medium text-emerald-600 mt-2 z-10">Terima kasih atas kerja keras Anda hari ini!</p>
      )}
    </div>
  );
}
