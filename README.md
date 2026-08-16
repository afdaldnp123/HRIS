# Enterprise HRIS & Payroll System

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Sistem Manajemen Sumber Daya Manusia (HRIS) dan Penggajian berskala *Enterprise* yang dirancang dengan arsitektur keamanan tinggi, enkripsi data sensitif, dan antarmuka *mobile-first* yang responsif.

## ✨ Fitur Utama

- 🔒 **Enkripsi Finansial Kelas Enterprise**: Data sensitif seperti Nominal Gaji Pokok dan Nomor Rekening dienkripsi di level aplikasi menggunakan `AES-256-GCM`.
- 📊 **Mesin Penggajian (Payroll Engine) dengan Snapshot**: Menggunakan sistem *Snapshot Locking*. Saat slip gaji dicetak, semua komponen tunjangan dan potongan dikunci permanen sehingga menjaga integritas data riwayat meskipun ada perubahan pada bulan berikutnya.
- 📱 **Mobile-First Employee Self Service (ESS)**: Portal karyawan dirancang 100% responsif (berbasis *Card Layout* pada layar *mobile*) untuk kemudahan absen, pengajuan cuti, cek slip gaji, dan klaim biaya dari *smartphone*.
- 🛡️ **Anti-Fraud & Jejak Audit (Audit Logs)**: Setiap perubahan pada entitas kritikal (seperti gaji atau profil) dicatat otomatis untuk mencegah penipuan internal.
- 💰 **Kalkulasi Pajak TER PPh 21**: Struktur database telah mendukung tabel referensi Pajak Tarif Efektif Rata-rata (TER) resmi pemerintah (TER A, B, dan C).
- 🧾 **Klaim Biaya (Reimbursement)**: Pengajuan klaim biaya langsung dari ponsel lengkap dengan sistem persetujuan (Approval) admin dan *bulk action*.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
- **PDF Generation**: `pdf-lib`

---

## 🚀 Panduan Instalasi (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal di komputer Anda.

### 1. Kloning Repositori
```bash
git clone https://github.com/afdaldnp123/HRIS.git
cd HRIS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment (Database & Kunci Rahasia)
Duplikat file `.env.example` dan ubah namanya menjadi `.env`.
```bash
cp .env.example .env
```
Buka file `.env` dan isi variabel berikut:
- `DATABASE_URL`: String koneksi PostgreSQL Anda.
- `NEXTAUTH_SECRET`: Generate kunci acak (bisa menggunakan `openssl rand -base64 32`).
- `ENCRYPTION_SECRET`: **WAJIB** tepat 32 karakter (Contoh: `12345678901234567890123456789012`).

### 4. Setup Database & Seeding
Jalankan migrasi Prisma untuk membuat tabel, lalu lakukan *seeding* untuk memasukkan akun Admin dan data awal.
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed     # (Asumsi Anda telah membuat custom script untuk seed)
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🔑 Akun Demo (Default Seed)
Jika Anda menggunakan *seeder* bawaan, berikut adalah kredensial yang bisa digunakan:

**1. Portal Admin HR/Finance**
- Email: `admin@perusahaan.com`
- Password: `Admin123!`

**2. Portal Karyawan (ESS)**
- Email: `karyawan1@perusahaan.com`
- Password: `Password123!`

*(Terdapat fitur Auto-Fill di halaman login untuk mempermudah saat pengembangan).*

---

## 🏗️ Struktur Proyek
- `/src/app` - Routing aplikasi Next.js (Admin, ESS, Login, API).
- `/src/components` - Komponen React yang dapat digunakan ulang (termasuk UI dari Shadcn).
- `/src/lib` - Utilitas aplikasi (`prisma.ts`, `auth.ts`, mesin `encryption.ts`, dan `payroll-engine.ts`).
- `/src/actions` - *Server Actions* untuk menangani mutasi data dari form secara aman.
- `/prisma` - Skema database (`schema.prisma`) dan file migrasi.

## 📝 Lisensi
Proyek ini dibuat untuk keperluan *Enterprise* privat. Hak Cipta &copy; 2026.
