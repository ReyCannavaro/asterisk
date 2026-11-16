# Overtime (Upah Kerja Lembur) Depnaker PP 35/2021 Matrix

Spesifikasi perhitungan upah lembur resmi pemerintah Indonesia berdasarkan **Peraturan Pemerintah (PP) Nomor 35 Tahun 2021** (aturan turunan UU Cipta Kerja).

---

## 1. Upah Sejam Dasar Lembur

Dasar perhitungan upah lembur satu jam adalah:
$$\text{Upah Lembur Sejam} = \frac{1}{173} \times \text{Upah Sebulan}$$

Komponen **Upah Sebulan**:
* Jika upah terdiri dari Gaji Pokok saja ➔ 100% Gaji Pokok.
* Jika upah terdiri dari Gaji Pokok + Tunjangan Tetap ➔ 100% (Gaji Pokok + Tunjangan Tetap).
* Jika upah terdiri dari Gaji Pokok + Tunjangan Tetap + Tunjangan Tidak Tetap:
  * Syarat: Gaji Pokok minimal 75% dari total upah.
  * Dasar lembur = Gaji Pokok + Tunjangan Tetap.

---

## 2. Matriks Pengali Lembur (Multiplier)

### A. Lembur Pada Hari Kerja Biasa
| Jam Lembur Ke- | Pengali (Multiplier) | Nilai Upah Lembur |
| :--- | :--- | :--- |
| **Jam Pertama (Jam ke-1)** | $1.5\times$ | $1.5 \times \text{Upah Sejam}$ |
| **Jam Berikutnya (Jam ke-2, ke-3, dst.)** | $2.0\times$ | $2.0 \times \text{Upah Sejam}$ |

*Contoh*: Karyawan bergaji Rp8.650.000 lembur 3 jam pada hari Rabu:
* Upah sejam = $8.650.000 / 173 = \text{Rp}50.000$
* Jam ke-1: $1.5 \times 50.000 = \text{Rp}75.000$
* Jam ke-2 & ke-3: $2 \times 2.0 \times 50.000 = \text{Rp}200.000$
* Total Upah Lembur = $\text{Rp}275.000$

---

### B. Lembur Pada Hari Istirahat Mingguan / Hari Libur Resmi
Tergantung skema kerja mingguan yang diterapkan klien:

#### 1. Skema 6 Hari Kerja (40 Jam/Minggu, 7 Jam/Hari):
| Rentang Jam Lembur | Pengali (Multiplier) |
| :--- | :--- |
| Jam ke-1 s.d. Jam ke-7 | $2.0\times \text{Upah Sejam}$ |
| Jam ke-8 | $3.0\times \text{Upah Sejam}$ |
| Jam ke-9 dan ke-10 | $4.0\times \text{Upah Sejam}$ |

#### 2. Skema 5 Hari Kerja (40 Jam/Minggu, 8 Jam/Hari - Standar Bank/IT):
| Rentang Jam Lembur | Pengali (Multiplier) |
| :--- | :--- |
| Jam ke-1 s.d. Jam ke-8 | $2.0\times \text{Upah Sejam}$ |
| Jam ke-9 | $3.0\times \text{Upah Sejam}$ |
| Jam ke-10, ke-11, ke-12 | $4.0\times \text{Upah Sejam}$ |

---

## 3. Ketentuan Wajib Lembur (Compliance Rules)

1. **Batas Waktu Maksimal Lembur**:
   * Maksimal **4 jam per hari** atau **18 jam per minggu** (tidak termasuk lembur pada hari libur resmi).
2. **Kewajiban Perusahaan**:
   * Perintah lembur tertulis dari atasan (*Surat Perintah Kerja Lembur / SPKL*).
   * Makanan dan minuman bergizi minimal 1.400 kkal jika lembur berlangsung selama 4 jam atau lebih (tidak boleh diganti dalam bentuk uang pada hari kerja).
