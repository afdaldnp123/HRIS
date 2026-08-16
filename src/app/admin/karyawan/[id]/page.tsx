import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function KaryawanDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { department: true, user: true }
  });

  if (!employee) return notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/karyawan" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Detail Karyawan</h1>
          <p className="text-zinc-500 mt-1">Informasi lengkap profil karyawan.</p>
        </div>
        <div className="ml-auto">
          <Link href={`/admin/karyawan/${employee.id}/edit`} className={buttonVariants()}>
            <Edit className="w-4 h-4 mr-2" /> Edit Data
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-500">Nomor Induk Pegawai (NIP)</p>
              <p className="font-medium text-zinc-900">{employee.nip}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Nama Lengkap</p>
              <p className="font-medium text-zinc-900">{employee.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Email Akses</p>
              <p className="font-medium text-zinc-900">{employee.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Nomor Telepon</p>
              <p className="font-medium text-zinc-900">{employee.phone || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-500">Departemen</p>
              <p className="font-medium text-zinc-900">{employee.department.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Status Pekerjaan</p>
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 ring-1 ring-inset ring-zinc-500/20 mt-1">
                {employee.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Tanggal Bergabung</p>
              <p className="font-medium text-zinc-900">
                {Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(employee.joinDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Kode PTKP</p>
              <p className="font-medium text-zinc-900">{employee.ptkpCode}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
