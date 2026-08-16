import prisma from "@/lib/prisma";
import { KaryawanForm } from "@/components/karyawan-form";

export const dynamic = "force-dynamic";

export default async function TambahKaryawanPage() {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  
  const year = new Date().getFullYear();
  const lastEmployee = await prisma.employee.findFirst({
    where: { nip: { startsWith: `EMP${year}` } },
    orderBy: { nip: 'desc' }
  });
  
  let nextSeq = 1;
  if (lastEmployee) {
    const seqString = lastEmployee.nip.substring(7);
    const lastSeq = parseInt(seqString, 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }
  const nextNip = `EMP${year}${nextSeq.toString().padStart(4, '0')}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Tambah Karyawan</h1>
        <p className="text-zinc-500 mt-1">Pendaftaran karyawan baru dan integrasi akun.</p>
      </div>
      <KaryawanForm departments={departments} nextNip={nextNip} />
    </div>
  );
}
