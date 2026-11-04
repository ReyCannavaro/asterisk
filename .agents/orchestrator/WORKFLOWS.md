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

---

## 4. Workflow Ekstraksi Desain & FigCraft Canvas

```text
[Terima Gambar Referensi / Screenshot dari User]
        │
        ▼
[Buka Skill: figcraft-designer (SKILL.md + references)]
        │
        ▼
[Fase 1: Dekonstruksi Visual (Grid, Spasi 4px/8px, Tipografi, Kontras)]
        │
        ▼
[Fase 2: Pemetaan Token Semantik (Variables Color, Spacing, Radius)]
        │
        ▼
[Fase 3: Penyusunan Auto-Layout Tree (Hug/Fill/Fixed, Padding, Gap)]
        │
        ▼
[Fase 4: Deklarasi Komponen & Varian Status (Normal vs Showing Mode)]
        │
        ▼
[Fase 5: Generasi FigCraft Node AST JSON / Blueprint Siap Pakai di Kanvas]
```

1. **Auto-Layout Wajib:** Semua elemen wajib dibungkus dalam Auto-Layout (`HORIZONTAL` atau `VERTICAL`) dengan aturan sizing (`HUG`, `FILL`, `FIXED`) yang jelas.
2. **Anti-Slop:** Gunakan palet taktikal Asterisk (Obsidian, Amber, Emerald, Cyan) dan hindari gradien ungu tebal atau drop shadow kartun.
