"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function PayrollFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const m = formData.get('month') as string;
    const y = formData.get('year') as string;
    
    const params = new URLSearchParams();
    if (m && m !== 'ALL') params.set('m', m);
    if (y && y !== 'ALL') params.set('y', y);
    
    router.push(`/admin/payroll?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-3">
      <select 
        name="month" 
        defaultValue={searchParams.get('m') || 'ALL'}
        className="h-10 px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="ALL">Semua Bulan</option>
        {[...Array(12)].map((_, i) => (
          <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
        ))}
      </select>
      <select 
        name="year" 
        defaultValue={searchParams.get('y') || 'ALL'}
        className="h-10 px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="ALL">Semua Tahun</option>
        {[2025, 2026, 2027].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button type="submit" className="hidden">Submit</button>
    </form>
  );
}
