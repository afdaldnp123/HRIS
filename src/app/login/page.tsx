"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.");
      setIsLoading(false);
    } else {
      router.refresh(); 
      router.push('/'); 
    }
  };

  const handleAutoFillAdmin = () => {
    setEmail("admin@perusahaan.com");
    setPassword("Admin123!");
  };

  const handleAutoFillKaryawan = () => {
    setEmail("karyawan1@perusahaan.com");
    setPassword("Password123!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 relative overflow-hidden p-4">
      {/* Subtle light orb for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[100px] pointer-events-none shadow-2xl" />
      
      <div className="w-full max-w-[420px] relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-zinc-200 shadow-sm">
            <LockKeyhole className="text-zinc-900 w-6 h-6" />
          </div>
        </div>

        <Card className="w-full shadow-xl border-zinc-200 bg-white/80 backdrop-blur-xl rounded-2xl">
          <CardHeader className="space-y-3 text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
              Enterprise HRIS
            </CardTitle>
            <CardDescription className="text-zinc-500 text-sm font-medium">
              Sistem Manajemen SDM & Penggajian Terenkripsi
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 font-semibold text-xs uppercase tracking-wide">Email Akses</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@perusahaan.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-zinc-900 transition-colors shadow-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-700 font-semibold text-xs uppercase tracking-wide">Kata Sandi</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-zinc-900 transition-colors pr-10 shadow-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 mt-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk ke Sistem"}
              </Button>

              <div className="pt-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-200"></div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mode Demo</span>
                <div className="flex-1 h-px bg-zinc-200"></div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-9 bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-medium transition-colors shadow-sm"
                  onClick={handleAutoFillAdmin}
                  disabled={isLoading}
                >
                  Auto Fill Admin
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-9 bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-medium transition-colors shadow-sm"
                  onClick={handleAutoFillKaryawan}
                  disabled={isLoading}
                >
                  Auto Fill Karyawan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-10 text-center text-[11px] font-semibold tracking-[0.2em] uppercase space-y-2">
          <p className="text-zinc-500">&copy; 2026 Enterprise HRIS</p>
          <div className="flex items-center justify-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4" />
            <p>Dilindungi Enkripsi AES-256</p>
          </div>
        </div>
      </div>
    </div>
  );
}
