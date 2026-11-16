# Showing Feedback Triage & Root Cause Methodology

Metodologi dekonstruksi dan analisis masukan (*feedback analysis*) dari sesi presentasi demo (*showing*) bersama klien.

---

## 1. Kuadran Klasifikasi Feedback

Setiap masukan klien yang dicatat selama live showing wajib diklasifikasikan ke dalam 4 kuadran:

```text
               URGENSI TINGGI
                     │
    [KUADRAN 1]      │      [KUADRAN 2]
    CRITICAL BUG     │      CLIENT CORE SPEC
    (Harus Beres H+1)│      (Fitur Sesuai Kontrak)
─────────────────────┼─────────────────────
    [KUADRAN 3]      │      [KUADRAN 4]
    SHOWING POLISH   │      SCOPE CREEP / WISHLIST
    (UI Demo Tweak)  │      (Masuk Backlog Fase 2)
                     │
               URGENSI RENDAH
```

### 1. Kuadran 1: Critical Bug
* **Ciri**: Fitur crash, data salah tampil, error 500, atau kebocoran data rahasia saat demo.
* **Tindakan**: Langsung buat tiket prioritas `P0`, koordinasikan dengan `CELLIST` (Backend) atau `VIOLINIST` (Frontend).

### 2. Kuadran 2: Client Core Specification
* **Ciri**: Klien mengklarifikasi aturan bisnis spesifik perusahaan mereka yang sebelumnya belum terakomodasi.
* **Tindakan**: Buat spesifikasi kebutuhan teknis lengkap dengan *Acceptance Criteria* sebelum diteruskan ke developer.

### 3. Kuadran 3: Showing Polish & Presentation Tweaks
* **Ciri**: Masukan kosmetik, urutan tombol yang membingungkan saat demo, atau perlunya tombol *seed fake data* agar presentasi berikutnya lebih mulus.
* **Tindakan**: Jadwalkan perbaikan cepat (*quick-win*) bersama tim UI.

### 4. Kuadran 4: Scope Creep & Wishlist
* **Ciri**: Permintaan fitur tambahan yang tidak ada di kesepakatan awal dan di luar batasan PRD.
* **Tindakan**: Serahkan ke `BATON` (Lead PM) untuk negosiasi kontrak tambahan atau disimpan di roadmap masa depan.

---

## 2. Diagram Alir Konversi Feedback ke Tiket Developer

```text
[Masukan Klien dari Showing Session]
                 │
                 ▼
     [Analisis Akar Masalah (Root Cause)]
                 │
                 ├─► Apakah Masalah UI/Visual? ────► [Tiket Frontend VIOLINIST]
                 │
                 ├─► Apakah Masalah Data/API? ─────► [Tiket Backend CELLIST]
                 │
                 ├─► Apakah Masalah Kontrak/Tipe? ─► [Tiket Integrasi HARPIST]
                 │
                 └─► Apakah Masalah Keamanan? ─────► [Tiket Security PERCUSSIONIST]
```
