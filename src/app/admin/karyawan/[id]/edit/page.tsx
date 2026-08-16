import prisma from "@/lib/prisma";
import { KaryawanForm } from "@/components/karyawan-form";
import { notFound } from "next/navigation";
import { decryptData } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export default async function EditKaryawanPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!employee) return notFound();

  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  
  // Decrypt data to show in form
  let baseSalary = "";
  let bankAccountNumber = "";
  try {
    if (employee.baseSalary) baseSalary = decryptData(employee.baseSalary);
    if (employee.bankAccountNumber) bankAccountNumber = decryptData(employee.bankAccountNumber);
  } catch(e) {
    console.error("Error decrypting employee data", e);
  }

  const initialData = {
    id: employee.id,
    email: employee.user.email,
    nip: employee.nip,
    fullName: employee.fullName,
    phone: employee.phone || "",
    departmentId: employee.departmentId,
    joinDate: employee.joinDate.toISOString().split('T')[0],
    status: employee.status,
    baseSalary: baseSalary,
    bankName: employee.bankName || "",
    bankAccountNumber: bankAccountNumber,
    ptkpCode: employee.ptkpCode,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Karyawan</h1>
        <p className="text-zinc-500 mt-1">Perbarui data informasi karyawan.</p>
      </div>
      <KaryawanForm departments={departments} nextNip={employee.nip} initialData={initialData} isEdit />
    </div>
  );
}
