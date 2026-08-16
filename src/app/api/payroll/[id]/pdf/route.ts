import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const payrollItem = await prisma.payrollItem.findUnique({
      where: { id },
      include: { 
        payroll: true, 
        employee: true 
      }
    });

    if (!payrollItem) return new NextResponse("Not Found", { status: 404 });

    if (session.user.role !== "ADMIN" && session.user.id !== payrollItem.employee.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    
    page.drawText('SLIP GAJI KARYAWAN', { x: 50, y: height - 50, size: 20, font: boldFont });
    page.drawText(`Periode: ${payrollItem.payroll.periodMonth}/${payrollItem.payroll.periodYear}`, { x: 50, y: height - 80, size: 12, font });
    page.drawText(`NIP: ${payrollItem.employee.nip}`, { x: 50, y: height - 120, size: 12, font });
    page.drawText(`Nama: ${payrollItem.employee.fullName}`, { x: 50, y: height - 140, size: 12, font });

    page.drawText(`Gaji Pokok: Rp ${payrollItem.baseSalarySnap.toString()}`, { x: 50, y: height - 180, size: 12, font });
    page.drawText(`Total Tunjangan: Rp ${payrollItem.totalAllowances.toString()}`, { x: 50, y: height - 200, size: 12, font });
    page.drawText(`Total Potongan (Lainnya): Rp ${payrollItem.totalDeductions.toString()}`, { x: 50, y: height - 220, size: 12, font });
    page.drawText(`Potongan BPJS Karyawan: Rp ${payrollItem.bpjsEmployeeSnap.toString()}`, { x: 50, y: height - 240, size: 12, font });
    page.drawText(`Potongan PPh 21: Rp ${payrollItem.pph21Snap.toString()}`, { x: 50, y: height - 260, size: 12, font });
    
    page.drawText(`TAKE HOME PAY: Rp ${payrollItem.netSalary.toString()}`, { x: 50, y: height - 300, size: 14, font: boldFont });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="slip_gaji_${payrollItem.employee.nip}.pdf"`
      }
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
