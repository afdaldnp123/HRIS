"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createEmployee, updateEmployee } from "@/actions/employee";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function KaryawanForm({ 
  departments, 
  nextNip, 
  initialData, 
  isEdit = false 
}: { 
  departments: { id: string, name: string }[], 
  nextNip: string,
  initialData?: any,
  isEdit?: boolean
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      id: initialData?.id,
      email: formData.get("email") as string,
      nip: formData.get("nip") as string,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      departmentId: formData.get("departmentId") as string,
      joinDate: formData.get("joinDate") as string,
      status: formData.get("status") as string,
      baseSalary: formData.get("baseSalary") as string,
      bankName: formData.get("bankName") as string,
      bankAccountNumber: formData.get("bankAccountNumber") as string,
      ptkpCode: formData.get("ptkpCode") as string,
    };

    const res = isEdit ? await updateEmployee(data) : await createEmployee(data);
    if (res.success) {
      toast.success("Berhasil", { description: isEdit ? "Data karyawan telah diperbarui." : "Data karyawan baru telah disimpan." });
      router.push("/admin/karyawan");
    } else {
      toast.error("Gagal", { description: res.error || "Gagal menyimpan data." });
      setError(res.error || "Gagal menyimpan data.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100 text-sm">
          {error}
        </div>
      )}

      <Card className="shadow-sm border-zinc-200">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nip">Nomor Induk Pegawai (NIP)</Label>
                <Input id="nip" name="nip" required readOnly defaultValue={nextNip} className="bg-zinc-50 text-zinc-500 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" name="fullName" required defaultValue={initialData?.fullName} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Akses</Label>
                <Input id="email" name="email" type="email" required placeholder="karyawan@perusahaan.com" defaultValue={initialData?.email} readOnly={isEdit} className={isEdit ? "bg-zinc-50 text-zinc-500" : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" name="phone" defaultValue={initialData?.phone} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departemen</Label>
                <Select name="departmentId" required defaultValue={initialData?.departmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status Pekerjaan</Label>
                <Select name="status" defaultValue={initialData?.status || "PROBATION"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERMANENT">Karyawan Tetap</SelectItem>
                    <SelectItem value="CONTRACT">Kontrak</SelectItem>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Tanggal Bergabung</Label>
              <Input id="joinDate" name="joinDate" type="date" required defaultValue={initialData?.joinDate} />
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-6">
              <h3 className="font-semibold text-zinc-900">Data Finansial & Pajak (Encrypted)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="baseSalary">Gaji Pokok (Base Salary)</Label>
                <Input id="baseSalary" name="baseSalary" type="number" required placeholder="Contoh: 10000000" defaultValue={initialData?.baseSalary} />
                <p className="text-xs text-zinc-400">Data ini akan dienkripsi dengan AES-256 secara otomatis.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nama Bank</Label>
                  <Input id="bankName" name="bankName" placeholder="Contoh: BCA" defaultValue={initialData?.bankName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Nomor Rekening</Label>
                  <Input id="bankAccountNumber" name="bankAccountNumber" placeholder="Akan dienkripsi" defaultValue={initialData?.bankAccountNumber} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ptkpCode">Kode PTKP</Label>
                <Select name="ptkpCode" defaultValue={initialData?.ptkpCode || "TK/0"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kode PTKP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TK/0">TK/0</SelectItem>
                    <SelectItem value="K/0">K/0</SelectItem>
                    <SelectItem value="K/1">K/1</SelectItem>
                    <SelectItem value="K/2">K/2</SelectItem>
                    <SelectItem value="K/3">K/3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : isEdit ? "Perbarui Karyawan" : "Simpan Karyawan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
