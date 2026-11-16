# Showing Session & Feedback Triage Standard Operating Procedure (SOP)

Panduan operasional bagi Lead Project Manager (**BATON**) dalam memimpin sesi demo mingguan (*showing*) bersama klien HRIS vendor, merekam masukan secara live, dan mengeksekusi pipeline konversi ke tiket developer.

---

## 1. Fase Pra-Showing (Persiapan H-1 Jam)

1. **Verifikasi Kesiapan Instance**:
   - Pastikan environment staging klien (misal `staging.adaro.asterisk.internal`) aktif dan database telah diisi *seed data* realistis tanpa PII (Personally Identifiable Information).
2. **Uji Coba Showing Mode Switch**:
   - Tekan `Ctrl+Shift+S`.
   - Pastikan banner `🛡️ SHOWING ACTIVE` muncul di header dan semua kredensial tersensor `••••••••••••`.
3. **Buka Sesi Baru di Asterisk**:
   - Klik `+ New Showing Session` di menu *Showing Log*.
   - Pilih nama klien, tanggal sesi, dan daftar peserta eksternal yang diundang.

---

## 2. Fase Live Showing (Saat Presentasi Layar)

1. **Perekaman Masukan Real-Time (Live Feedback Capture)**:
   - Setiap kali stakeholder klien memberikan komentar, feedback dicatat langsung di drawer samping Asterisk:
     - Deskripsi keluhan/keinginan.
     - Modul terdampak (`Payroll`, `Attendance`, `Claim`, dll.).
     - Tingkat urgensi (*Severity*): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
2. **Kategorisasi Cepat (Triage Tag)**:
   - `BUG_CRITICAL`: Kesalahan fungsional yang memalukan atau menghentikan alur operasional.
   - `SHOWING_ENHANCEMENT`: Masukan terkait kenyamanan demo atau kebutuhan preset dummy data.
   - `CLIENT_CUSTOM_REQ`: Perbedaan aturan bisnis spesifik korporasi (misal lembur shift offshore).

---

## 3. Fase Pasca-Showing (Maksimal H+2 Jam)

1. **Konversi Feedback Menjadi Tiket Kanban**:
   - Klik `Convert to Task` pada item feedback yang disetujui.
   - Tiket otomatis masuk ke kolom **To Do** di board kanban dengan label modul terkait.
2. **Penetapan Assignee & Due Date**:
   - Masalah skema DB / API ➔ Assign ke tim Backend (`CELLIST`).
   - Masalah tampilan / interaksi UI ➔ Assign ke tim Frontend (`VIOLINIST`).
   - Masalah rumus BPJS / TER ➔ Review ke Business Analyst (`FLUTIST`).
3. **Pengiriman Ringkasan Otomatis ke Klien**:
   - Ekspor ringkasan sesi berformat Markdown / PDF tanpa menyertakan catatan teknis internal rahasia.
