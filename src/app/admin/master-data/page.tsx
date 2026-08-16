import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MasterDataDeleteAction } from "@/components/master-data-actions";
import { DepartmentModal, AllowanceModal, DeductionModal } from "@/components/master-data-crud-modal";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  const allowancesRaw = await prisma.allowanceType.findMany({ orderBy: { name: 'asc' } });
  const deductionsRaw = await prisma.deductionType.findMany({ orderBy: { name: 'asc' } });

  const allowances = allowancesRaw.map(a => ({ ...a, defaultValue: a.defaultValue.toString() }));
  const deductions = deductionsRaw.map(d => ({ ...d, defaultValue: d.defaultValue.toString() }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pengaturan Master Data</h1>
        <p className="text-zinc-500 mt-1">Kelola komponen tunjangan, potongan, dan departemen perusahaan.</p>
      </div>
      
      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="departments">Departemen</TabsTrigger>
          <TabsTrigger value="allowances">Tunjangan</TabsTrigger>
          <TabsTrigger value="deductions">Potongan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments" className="mt-6 space-y-4">
          <div className="flex justify-end"><DepartmentModal /></div>
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Nama Departemen</TableHead><TableHead className="w-[120px]">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {departments.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.code}</TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DepartmentModal initialData={d} />
                          <MasterDataDeleteAction id={d.id} name={d.name} type="DEPARTMENT" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-4">Data kosong.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile View */}
            <div className="md:hidden p-4 space-y-3 bg-zinc-50/50">
              {departments.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">Data kosong.</div>
              ) : departments.map(d => (
                <div key={d.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-zinc-900">{d.name}</h4>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">KODE: {d.code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DepartmentModal initialData={d} />
                      <MasterDataDeleteAction id={d.id} name={d.name} type="DEPARTMENT" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="allowances" className="mt-6 space-y-4">
          <div className="flex justify-end"><AllowanceModal /></div>
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow><TableHead>Nama Tunjangan</TableHead><TableHead>Tipe</TableHead><TableHead>Kena Pajak?</TableHead><TableHead className="w-[120px]">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {allowances.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.type}</TableCell>
                      <TableCell>{a.isTaxable ? 'Ya' : 'Tidak'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <AllowanceModal initialData={a} />
                          <MasterDataDeleteAction id={a.id} name={a.name} type="ALLOWANCE" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allowances.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-4">Data kosong.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile View */}
            <div className="md:hidden p-4 space-y-3 bg-zinc-50/50">
              {allowances.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">Data kosong.</div>
              ) : allowances.map(a => (
                <div key={a.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-zinc-900">{a.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Tipe: {a.type}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <AllowanceModal initialData={a} />
                      <MasterDataDeleteAction id={a.id} name={a.name} type="ALLOWANCE" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Pajak:</span>
                    <span className="font-medium">{a.isTaxable ? 'Kena Pajak' : 'Tidak'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deductions" className="mt-6 space-y-4">
          <div className="flex justify-end"><DeductionModal /></div>
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow><TableHead>Nama Potongan</TableHead><TableHead>Tipe</TableHead><TableHead className="w-[120px]">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {deductions.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DeductionModal initialData={d} />
                          <MasterDataDeleteAction id={d.id} name={d.name} type="DEDUCTION" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deductions.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-4">Data kosong.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4 space-y-3 bg-zinc-50/50">
              {deductions.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">Data kosong.</div>
              ) : deductions.map(d => (
                <div key={d.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-zinc-900">{d.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Tipe: {d.type}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <DeductionModal initialData={d} />
                      <MasterDataDeleteAction id={d.id} name={d.name} type="DEDUCTION" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
