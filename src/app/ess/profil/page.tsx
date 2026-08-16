import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decryptData } from "@/lib/encryption";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle, Briefcase, CreditCard, Phone, Building, LockKeyhole } from "lucide-react";
import { EssChangePassword } from "@/components/ess-change-password";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { department: true }
  });

  if (!employee) return <div>Data karyawan tidak ditemukan.</div>;

  return (
    <div className="space-y-6 w-full max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Profil Saya</h1>
        <p className="text-zinc-500 mt-1">Informasi pribadi dan detail pekerjaan Anda yang tercatat di sistem.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Kolom Kiri: Informasi Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCircle className="w-5 h-5 text-zinc-500" />
                  Informasi Pribadi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-zinc-500">Nama Lengkap</div>
                  <div className="font-semibold text-zinc-900 mt-1">{employee.fullName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-500">Email Akses</div>
                  <div className="font-semibold text-zinc-900 mt-1">{session.user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-500 flex items-center gap-1"><Phone className="w-4 h-4"/> Nomor Telepon</div>
                  <div className="font-semibold text-zinc-900 mt-1">{employee.phone || "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-zinc-500" />
                  Detail Pekerjaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-zinc-500">Nomor Induk Pegawai (NIP)</div>
                  <div className="font-semibold text-zinc-900 mt-1">{employee.nip}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-500 flex items-center gap-1"><Building className="w-4 h-4"/> Departemen</div>
                  <div className="font-semibold text-zinc-900 mt-1">{employee.department.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-500">Status Karyawan</div>
                  <div className="mt-1 inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800 ring-1 ring-inset ring-zinc-500/20">
                    {employee.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-zinc-500" />
                Informasi Rekening & Pajak (Terenkripsi)
              </CardTitle>
              <CardDescription>Data ini dilindungi dengan enkripsi AES-256 tingkat perbankan.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="text-sm font-medium text-zinc-500">Rekening Bank</div>
                <div className="font-mono font-semibold text-zinc-900 mt-1">
                  {employee.bankName} - {employee.bankAccountNumber ? decryptData(employee.bankAccountNumber) : "Belum diatur"}
                </div>
              </div>
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="text-sm font-medium text-zinc-500">Status PTKP</div>
                <div className="font-semibold text-zinc-900 mt-1">
                  {employee.ptkpCode || "TK/0"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Keamanan */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LockKeyhole className="w-5 h-5 text-zinc-500" />
                Keamanan Akun
              </CardTitle>
              <CardDescription>Ubah kata sandi Anda secara berkala untuk menjaga keamanan akun Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <EssChangePassword />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
