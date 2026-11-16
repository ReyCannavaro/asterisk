# ARRANGEMENT: Matriks Aransemen Kebutuhan ke Orkestra & Skill

Gunakan tabel matriks di bawah ini untuk menentukan instrumen orkestra di [`.agents/orchestra/`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/) dan skill di [`.agents/skills/`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/skills/) yang **wajib di-load (`read_file`)** sebelum memulai pekerjaan:

---

## 1. Matriks Routing Otomatis

| Kategori Tugas | Kata Kunci / Konteks | Instrumen Utama (*Soloist*) | Skill yang Wajib Diaktifkan |
| :--- | :--- | :--- | :--- |
| **Frontend UI & Layout** | Halaman Astro, komponen React, hero section, card kanban, navigasi, styling | **VIOLINIST** (`VIOLINIST.md`) | `design-taste-frontend`<br>`responsive-craft` |
| **Kanvas FigCraft & Branding** | Gambar referensi, Auto-Layout, frame FigCraft, logo Swiss Monolith, token | **ARTIST** (`ARTIST.md`) | `figcraft-designer`<br>`high-end-visual-design`<br>`brandkit` |
| **Backend API & Database** | Endpoint Elysia, query DB, skema Drizzle ORM, 13 tabel, migrasi, typebox | **CELLIST** (`CELLIST.md`) | `full-output-enforcement`<br>`context7-mcp` |
| **Keamanan & Showing Mode** | Vault credential, AES-256-GCM, masking password, anti-leak demo, RBAC, audit log | **PERCUSSIONIST** (`PERCUSSIONIST.md`) | `rules/user-verification` |
| **Analisis Kebutuhan Sistem & Spesifikasi Fitur** | Analisis requirement, dekonstruksi feedback demo, user stories, acceptance criteria | **FLUTIST** (`FLUTIST.md`) | `context7-mcp` |
| **Integrasi End-to-End** | Eden Treaty, type sync frontend-backend, fetch client, optimistic kanban | **HARPIST** (`HARPIST.md`) | `full-output-enforcement`<br>`context7-mcp` |
| **Project Management & Sesi** | Scope PRD, sprint ticket, triage Showing Feedback, jadwal demo, pembagian tugas | **BATON** (`BATON.md`) | `automation` |
| **Code Review & Anti-Slop** | Linter, typecheck, verifikasi boundary modul, anti-slop check, refactoring | **TUNER** (`TUNER.md`) | `react-best-practices`<br>`full-output-enforcement` |
| **Pengujian & Leak Audit** | QA test, leak simulation saat showing mode, E2E test, multi-tenant boundary | **AUDITOR** (`AUDITOR.md`) | `browser-use`<br>`rules/user-verification` |

---

## 2. Aturan Harmoni Simfoni (*Ensemble Chaining Rules*)

1. **Ketika Mengerjakan Fitur Baru secara Penuh (Full Feature):**  
   Alur bermain: **BATON** (definisi scope) ➔ **FLUTIST** (spesifikasi kebutuhan teknis) ➔ **CELLIST** (skema DB & API) ➔ **VIOLINIST** (antarmuka UI) ➔ **HARPIST** (koneksi Eden Treaty) ➔ **PERCUSSIONIST** (sensor Showing Mode) ➔ **TUNER** (QC code review) ➔ **AUDITOR** (leak test).
2. **Ketika Mengerjakan Tampilan Antarmuka Baru:**  
   Wajib mengombinasikan **ARTIST** (cek kanvas FigCraft) + **VIOLINIST** (tulis komponen) + skill `design-taste-frontend` + `responsive-craft`.
3. **Ketika Mengubah Modul Credential Vault:**  
   Wajib menyertakan **PERCUSSIONIST** untuk memastikan tidak ada plaintext secret yang terkirim tanpa enkripsi AES-256-GCM dan sensor Showing Mode.
