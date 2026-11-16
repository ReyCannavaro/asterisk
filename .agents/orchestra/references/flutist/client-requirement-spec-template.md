# Client Requirement Specification Template & Analysis Standard

Panduan kerja resmi untuk **FLUTIST (System & Requirement Analyst)** dalam membedah permintaan fitur baru atau perubahan sistem dari klien vendor menjadi spesifikasi teknis siap bangun (*ready-for-dev*).

---

## 1. Anatomi Spesifikasi Fitur Klien

Setiap kebutuhan baru yang masuk dari sesi showing atau permintaan klien wajib dianalisis mengikuti format standar ini:

```markdown
### [REQ-ID]: <Nama Fitur Singkat & Jelas>
* **Client / Tenant**: <Nama Klien, misal: Client-Alpha>
* **Affected Environment**: Development / Staging / Production
* **System Module**: Auth / Database / API / Integration / UI / Reporting
* **Urgency / Priority**: P0 (Blocker) / P1 (High) / P2 (Medium) / P3 (Low)

#### 1. Latar Belakang Masalah (User Problem)
<Deskripsikan mengapa klien membutuhkan fitur ini dan apa kendala yang mereka alami saat ini>

#### 2. Kebutuhan Fungsional (Functional Requirements)
1. Sistem HARUS mampu ...
2. Sistem TIDAK BOLEH ...
3. Pengguna dengan peran X DAPAT melakukan aksi Y ...

#### 3. Acceptance Criteria (Kriteria Keberterimaan)
Menggunakan format perilaku teruji (Given-When-Then):
* **Skenario 1: Happy Path**
  * **Given**: Pengguna telah terautentikasi dengan hak akses `ADMIN`
  * **When**: Pengguna mengirimkan data perubahan konfigurasi
  * **Then**: Sistem menyimpan data, merespons HTTP 200, dan mencatat entri ke audit log
* **Skenario 2: Validation Failure**
  * **Given**: Input yang diberikan tidak sesuai skema
  * **When**: Permintaan dikirim ke server
  * **Then**: Sistem menolak dengan HTTP 400 disertai pesan error yang deskriptif

#### 4. Kebutuhan Non-Fungsional & Security Constraint
* **Showing Mode Impact**: Apakah fitur ini menampilkan informasi sensitif yang wajib di-masking saat demo live?
* **Performance**: Waktu respons maksimal API < 200ms.
* **Audit Trail**: Wajib mencatat timestamp, user ID, dan perubahan state lama vs baru.
```

---

## 2. Checklist Kesiapan Spesifikasi (Definition of Ready / DoR)

Sebelum sebuah spesifikasi diserahkan kepada tim engineering (`CELLIST`, `VIOLINIST`, `HARPIST`):
- [ ] Batasan scope telah disepakati bersama `BATON` (Lead PM) agar terhindar dari *scope creep*.
- [ ] Dampak terhadap Showing Mode telah teridentifikasi (kolom mana yang harus disensor).
- [ ] Skema payload input dan output telah terpetakan dengan tipe data yang jelas.
- [ ] Skenario kegagalan (edge cases: token kedaluwarsa, network drop, data duplikat) terdokumentasi.
