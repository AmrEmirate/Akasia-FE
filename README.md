# 🌿 AKASIA LOGISTIK Frontend (POS Kasir Sub-Agent ID Express)

Frontend antarmuka loket kasir dan operasional gerai **AKASIA LOGISTIK** (Sub-Agent Counter POS ID Express). Dibangun dengan Next.js App Router, React 19, TypeScript, dan Tailwind CSS v4.

---

## 🚀 Fitur Utama

1. **POS Kasir Loket Gerai (`/`)**:
   - Alur input kasir super cepat dengan navigasi keyboard (`F2` Buka Form, `F8` Timbang, `F12` Bayar & Cetak, `ESC` Batal).
   - Integrasi pembacaan berat sensor timbangan digital COM3 real-time (`Sensor Terkunci`).
   - Audit volumetrik otomatis: membandingkan berat aktual vs formula volumetrik `(P x L x T) / 6000`.
   - Preview & simulator cetak stiker thermal 100x150 mm standar ID Express (Barcode Code 128, rute hub sortir, rincian COD/Non-COD).
2. **Manifest Batch Pickup Handover (`/manifest-batch`)**:
   - Pengelompokan paket ke dalam bin sortir staging.
   - Barcode scanning verifikasi koli sebelum diserahkan ke armada.
   - Form penjemputan driver & plat armada serta cetak lembar BAST (Berita Acara Serah Terima) digital.
3. **Rekonsiliasi Komisi Gerai (`/rekonsiliasi-komisi`)**:
   - Kalkulator komisi multi-tier volume (Bronze 15%, Silver 18%, Gold 22%, Platinum 25%).
   - Ringkasan pembagian pendapatan gerai vs ID Express pusat dan riwayat settlement komisi.
4. **Universal Multi-Search CS Gerai (`/multi-search-cs`)**:
   - Mesin pencarian terpadu 3-in-1 (berdasarkan Nomor Resi ID Express, Nomor HP Pengirim, atau Nama Penerima).
   - Riwayat status pengiriman dan modal pencatatan tiket komplain pelanggan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (v15.5.28 - App Router)
- **UI Library**: React 19 & TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Typography**: Google Fonts (Space Grotesk, Inter, JetBrains Mono) & Google Material Symbols

---

## 💻 Cara Menjalankan

### 1. Install Dependensi
```bash
npm install
```

### 2. Jalankan Server Development
```bash
npm run dev
```
Aplikasi berjalan di `http://localhost:3001`.

### 3. Production Build
```bash
npm run build
npm run start
```
