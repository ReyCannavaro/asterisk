# WORKFLOWS: Standard Operating Procedures (SOP)

Alur kerja standar untuk setiap skenario pekerjaan pada repositori SeeMBG:

---

## 1. Workflow Pengerjaan Frontend Web (`apps/frontend`)

```text
[Analisis Desain & Brief]
        │
        ▼
[Buka Skill: design-taste-frontend & responsive-craft]
        │
        ▼
[Definisikan Design Tokens & Colors di index.css / tailwind]
        │
        ▼
[Implementasikan Komponen React secara Utuh (Full Output)]
        │
        ▼
[Validasi Responsif: Desktop Peta vs Mobile Cascading Dropdown]
```

1. **Desain Sistem Terlebih Dahulu:** Pastikan token warna dan tipografi konsisten sebelum membuat page.
2. **Uji 2 Tampilan:** Selalu uji tampilan desktop (>1024px) dan mobile (<768px). Di mobile, pastikan peta tidak menghalangi scroll vertikal pengguna.

---

## 2. Workflow Pengerjaan Backend API (`apps/backend`)

```text
[Rancang Skema Tabel Drizzle ORM]
        │
        ▼
[Terapkan Migrasi ke Remote DB server.qqltech.com]
        │
        ▼
[Buat Endpoint Elysia dengan Validasi Skema (TypeBox)]
        │
        ▼
[Export Type App untuk Konsumsi Eden Treaty di Frontend]
```

1. **Type-Safety End-to-End:** Selalu export `type App = typeof app` agar tim frontend mendapatkan autocomplete langsung.
2. **Validasi Input:** Gunakan `t.Object()` bawaan Elysia untuk semua parameter query dan request body.

---

## 3. Workflow Ekstraksi Data SPPG (`ETL Pipeline`)

1. Jalankan script penarik bundle static chunk.
2. Lakukan normalisasi teks (Title Case) dan sanitasi data string.
3. Simpan ke file baseline JSON.
4. Lakukan batch insert ke database PostgreSQL via Drizzle ORM.
5. Jalankan geocoding bertahap untuk SPPG yang sudah aktif/pilot.
