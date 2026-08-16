import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KaryawanFilters } from "@/components/karyawan-filters";
import { EmployeeDeleteAction } from "@/components/employee-delete-action";
import { Eye, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KaryawanPage(props: { searchParams: Promise<{ q?: string, dept?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";
  const dept = searchParams?.dept || "";
  const page = parseInt(searchParams?.page || "1", 10);
  const pageSize = 10;

  const whereCondition: any = {};
  
  if (q) {
    whereCondition.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { nip: { contains: q, mode: 'insensitive' } }
    ];
  }
  
  if (dept) {
    whereCondition.departmentId = dept;
  }

  const totalRecords = await prisma.employee.count({ where: whereCondition });
  const totalPages = Math.ceil(totalRecords / pageSize);

  const employees = await prisma.employee.findMany({
    where: whereCondition,
    include: { department: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Data Karyawan</h1>
          <p className="text-zinc-500 mt-1">Kelola informasi master data karyawan.</p>
        </div>
        <Link href="/admin/karyawan/tambah">
          <Button>+ Tambah Karyawan</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center">
        <KaryawanFilters departments={departments} />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                    Tidak ada data karyawan yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-zinc-900">{emp.nip}</TableCell>
                    <TableCell>{emp.fullName}</TableCell>
                    <TableCell>{emp.department.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 ring-1 ring-inset ring-zinc-500/20">
                        {emp.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(emp.joinDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/karyawan/${emp.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-zinc-400 hover:text-zinc-900" })}>
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/admin/karyawan/${emp.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" })}>
                          <Edit className="h-4 w-4" />
                        </Link>
                        <EmployeeDeleteAction id={emp.id} name={emp.fullName} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="border-t border-zinc-200 p-4 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex space-x-2">
              {page > 1 ? (
                <Link href={`/admin/karyawan?q=${encodeURIComponent(q)}&dept=${encodeURIComponent(dept)}&page=${page - 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Sebelumnya
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
              )}
              {page < totalPages ? (
                <Link href={`/admin/karyawan?q=${encodeURIComponent(q)}&dept=${encodeURIComponent(dept)}&page=${page + 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Selanjutnya
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>Selanjutnya</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
