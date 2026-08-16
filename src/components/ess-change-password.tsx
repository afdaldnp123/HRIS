"use client";

import { useState } from "react";
import { changePassword } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EssChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    const formData = new FormData(e.currentTarget);
    const res = await changePassword(formData);
    
    if (res.success) {
      setMessage("Kata sandi berhasil diperbarui.");
      setIsError(false);
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage(res.error || "Gagal mengubah kata sandi.");
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
        <Label htmlFor="oldPassword">Kata Sandi Lama</Label>
        <Input id="oldPassword" name="oldPassword" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Kata Sandi Baru</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
        {isLoading ? "Memproses..." : "Perbarui Kata Sandi"}
      </Button>
    </form>
  );
}
