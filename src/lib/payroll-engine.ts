import { decryptData } from "./encryption";
import { Prisma } from "@prisma/client";

// Konfigurasi BPJS sesuai regulasi
const BPJS_KES_COMPANY_RATE = 0.04;
const BPJS_KES_EMPLOYEE_RATE = 0.01;
const BPJS_KES_CAP = 12000000;

const BPJS_TK_JKM_RATE = 0.0024;
const BPJS_TK_JKK_RATE = 0.0024;
const BPJS_TK_JHT_COMPANY_RATE = 0.037;
const BPJS_TK_JHT_EMPLOYEE_RATE = 0.02;
const BPJS_TK_JP_COMPANY_RATE = 0.02;
const BPJS_TK_JP_EMPLOYEE_RATE = 0.01;
const BPJS_TK_JP_CAP = 10042300;

export function calculatePayroll(encryptedBaseSalary: string, ptkpCode: string) {
  const decryptedSalaryStr = decryptData(encryptedBaseSalary);
  if (decryptedSalaryStr === "DECRYPTION_ERROR") throw new Error("Gagal mendekripsi gaji pokok");
  
  const baseSalary = new Prisma.Decimal(decryptedSalaryStr);
  const baseNum = baseSalary.toNumber();

  // BPJS Kesehatan (Cap Rp 12.000.000)
  const kesBase = Math.min(baseNum, BPJS_KES_CAP);
  const bpjsKesCompany = kesBase * BPJS_KES_COMPANY_RATE;
  const bpjsKesEmployee = kesBase * BPJS_KES_EMPLOYEE_RATE;

  // BPJS Ketenagakerjaan
  const jkm = baseNum * BPJS_TK_JKM_RATE;
  const jkk = baseNum * BPJS_TK_JKK_RATE;
  const jhtCompany = baseNum * BPJS_TK_JHT_COMPANY_RATE;
  const jhtEmployee = baseNum * BPJS_TK_JHT_EMPLOYEE_RATE;
  
  const jpBase = Math.min(baseNum, BPJS_TK_JP_CAP);
  const jpCompany = jpBase * BPJS_TK_JP_COMPANY_RATE;
  const jpEmployee = jpBase * BPJS_TK_JP_EMPLOYEE_RATE;

  const totalBpjsCompany = bpjsKesCompany + jkm + jkk + jhtCompany + jpCompany;
  const totalBpjsEmployee = bpjsKesEmployee + jhtEmployee + jpEmployee;

  // Bruto
  const bruto = baseNum + totalBpjsCompany; // Asumsi tunjangan sementara 0

  // PPh 21 (Simulasi sangat sederhana TER)
  let terRate = 0;
  if (ptkpCode === "TK/0") terRate = 0.02;
  else if (ptkpCode === "K/0") terRate = 0.025;
  else if (ptkpCode === "K/1") terRate = 0.03;
  else terRate = 0.05;

  const pph21 = bruto * terRate;

  // Net Salary / Take Home Pay
  const netSalary = baseNum - totalBpjsEmployee - pph21;

  return {
    baseSalary: baseNum,
    bpjsCompany: totalBpjsCompany,
    bpjsEmployee: totalBpjsEmployee,
    pph21: pph21,
    netSalary: netSalary
  };
}
