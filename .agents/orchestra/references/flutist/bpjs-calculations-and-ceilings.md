# BPJS Ketenagakerjaan & BPJS Kesehatan: Statutory Rules & Ceilings

Spesifikasi kalkulasi komprehensif untuk modul Payroll Asterisk berdasarkan regulasi BPJS Ketenagakerjaan (PP 44/2015, PP 45/2015, PP 46/2015) dan BPJS Kesehatan (Perpres 64/2020).

---

## 1. Matriks Persentase Iuran BPJS

| Program Jaminan | Ditanggung Pemberi Kerja (Perusahaan) | Ditanggung Tenaga Kerja (Karyawan) | Total Iuran | Dasar Pengali |
| :--- | :--- | :--- | :--- | :--- |
| **JKK (Kecelakaan Kerja)** | 0.24% – 1.74% *(Sesuai Tingkat Risiko)* | 0.00% | 0.24% – 1.74% | Gaji Pokok + Tunjangan Tetap |
| **JKM (Kematian)** | 0.30% | 0.00% | 0.30% | Gaji Pokok + Tunjangan Tetap |
| **JHT (Hari Tua)** | 3.70% | 2.00% | 5.70% | Gaji Pokok + Tunjangan Tetap |
| **JP (Pensiun)** | 2.00% | 1.00% | 3.00% | Gaji Pokok + Tunjangan Tetap *(Capped)* |
| **BPJS Kesehatan** | 4.00% | 1.00% | 5.00% | Gaji Pokok + Tunjangan Tetap *(Capped)* |

---

## 2. Tingkat Risiko JKK Per Sektor Industri

Tarif JKK ditentukan oleh klasifikasi bidang usaha (KBLI) klien:
* **Kelompok I (Sangat Rendah)**: `0.24%` — Perbankan, IT, Konsultan, Asuransi (misal: Bank Mandiri).
* **Kelompok II (Rendah)**: `0.54%` — Ritel, Telekomunikasi, Percetakan (misal: Telkomsel).
* **Kelompok III (Sedang)**: `0.89%` — Pabrik Makanan, Otomotif, Logistik (misal: Indofood).
* **Kelompok IV (Tinggi)**: `1.27%` — Konstruksi umum, Transportasi Udara/Laut.
* **Kelompok V (Sangat Tinggi)**: `1.74%` — Pertambangan Batubara, Pengeboran Minyak, Kehutanan (misal: Adaro Energy).

---

## 3. Batas Atas Upah (Ceiling / Plafond) 2024

### A. Jaminan Pensiun (JP) BPJS Ketenagakerjaan
* Batas atas upah maksimal untuk perhitungan Jaminan Pensiun per **Maret 2024** adalah **Rp10.042.300** per bulan (dievaluasi per tahun berdasarkan inflasi/pertumbuhan PDB oleh BPJS TK).
* Jika upah karyawan adalah Rp25.000.000:
  $$\text{Iuran JP Perusahaan} = 2\% \times \text{Rp}10.042.300 = \text{Rp}200.846$$
  $$\text{Iuran JP Karyawan} = 1\% \times \text{Rp}10.042.300 = \text{Rp}100.423$$

### B. BPJS Kesehatan
* Batas atas upah maksimal per bulan adalah **Rp12.000.000**.
* Batas bawah adalah Upah Minimum Provinsi/Kabupaten (UMP/UMK).
* Jika upah karyawan adalah Rp20.000.000:
  $$\text{Iuran Kesehatan Perusahaan} = 4\% \times \text{Rp}12.000.000 = \text{Rp}480.000$$
  $$\text{Iuran Kesehatan Karyawan} = 1\% \times \text{Rp}12.000.000 = \text{Rp}120.000$$

---

## 4. Dampak Pajak PPh 21 atas Iuran BPJS

Untuk menghindari kesalahan perhitungan take-home pay:
1. **Penambah Penghasilan Bruto Karyawan untuk PPh 21**:
   * Iuran JKK yang dibayar perusahaan (karena merupakan fasilitas asuransi).
   * Iuran JKM yang dibayar perusahaan.
   * Iuran BPJS Kesehatan 4% yang dibayar perusahaan.
2. **BUKAN Penambah Bruto Karyawan**:
   * Iuran JHT 3.7% perusahaan (belum dinikmati saat ini).
   * Iuran JP 2% perusahaan.
3. **Pengurang Penghasilan Bruto Karyawan (di form 1721-A1 Desember)**:
   * Iuran JHT 2% yang dipotong dari gaji karyawan.
   * Iuran JP 1% yang dipotong dari gaji karyawan.
