# ASTERISK (`*`)

<div align="center">

```
    ___    _____ ______ ______ ____   ____ _____ __ __
   /   |  / ___//_  __// ____// __ \ /  _// ___// //_/
  / /| |  \__ \  / /  / __/  / /_/ / / /  \__ \/ ,<   
 / ___ | ___/ / / /  / /___ / _, _/_/ /  ___/ / /| |  
/_/  |_|/____/ /_/  /_____//_/ |_|/___/ /____/_/ |_|  
```

**All-in-one System for Tracking Environments, Repositories, Issues, & Software Knowledge**  
*Internal Developer Portal, Encrypted Secrets Vault, & Delivery Workspace khusus untuk manajemen multi-proyek HRIS.*

[![Domain](https://img.shields.io/badge/Production-asterisk.reycannavaro.dev-amber?style=flat-square&logo=cloudflare)](https://asterisk.reycannavaro.dev)
[![Backend](https://img.shields.io/badge/Backend-ElysiaJS_(Bun)-black?style=flat-square&logo=bun)](https://elysiajs.com)
[![Frontend](https://img.shields.io/badge/Frontend-Astro_TS_+_React-orange?style=flat-square&logo=astro)](https://astro.build)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_16_+_Drizzle-blue?style=flat-square&logo=postgresql)](https://orm.drizzle.team)
[![Orchestration](https://img.shields.io/badge/Orchestrator-moonrepo-purple?style=flat-square&logo=moon)](https://moonrepo.dev)
[![Cloud](https://img.shields.io/badge/Infrastructure-AWS_EC2_+_Docker-232F3E?style=flat-square&logo=amazon-aws)](https://aws.amazon.com)

</div>

---

## 🎯 Latar Belakang & Masalah
Sebagai Project Manager yang menangani implementasi sistem HRIS (*Human Resource Information System*) lintas klien pada perusahaan vendor, Asterisk dibangun untuk menuntaskan 4 masalah operasional utama:
1. **Kredensial & Akses Generator Tercecer**: Port dev/staging/prod, IP host server, dan password database sering tersebar di catatan lokal atau obrolan chat.
2. **Persebaran Spreadsheet Tak Terkontrol**: Tautan Google Sheets untuk feedback showing, support, dan UAT sering hilang atau tidak tersinkronisasi dengan backlog developer.
3. **Risiko Bocor Saat Screen-Sharing**: Rawan memperlihatkan kredensial server rahasia saat melakukan presentasi atau *showing* demo langsung di depan klien.
4. **Verifikasi QA Tidak Terpadu**: Belum adanya siklus resmi dari feedback showing &rarr; tiket dev &rarr; verifikasi QA &rarr; closed.

---

## 🚀 Fitur Unggulan

| Modul | Keterangan & Nilai Tambah |
| :--- | :--- |
| **🛡️ Dynamic & Complex RBAC** | Model perizinan ganda (**Global Tier** untuk Superadmin + **Project-Scoped Tier**). User yang sama bisa menjadi *Tech Lead* di Klien A, tetapi dilarang mengakses Klien B. |
| **🔐 Encrypted Secrets Vault** | Penyimpanan port server, link repo GitHub, dan password backend terenkripsi **AES-256-GCM**. Dilengkapi fitur buka password berwaktu (*15s Auto-mask*) dan pencatatan log audit otomatis. |
| **👁️ Showing Mode (Safe Demo Toggle)** | Tombol toggle global untuk menyamarkan seluruh port teknis, IP server, dan password menjadi label aman `[CONFIDENTIAL]` saat presentasi *screen-sharing* di depan klien. |
| **📊 Asterisk Sheet** | Antarmuka tabel cepat bergaya spreadsheet/Notion untuk mencatat notulensi feedback showing secara instan, lengkap dengan fitur **1-Click Convert to Ticket**. |
| **✅ Dual-Gate QA Workflow** | Alur tiket terstruktur: Developer hanya dapat memindahkan task ke *Ready for QA*, dan tiket hanya bisa ditutup (*Closed*) setelah diverifikasi resmi oleh tim QA. |
| **📜 Immutable Audit Trail** | Pencatatan otomatis anti-manipulasi (*append-only*) untuk setiap aksi sensitif (siapa yang membuka password, kapan, dan dari IP mana). |

---

## 🌐 Alokasi Domain & Port

| Layer / Service | Target Domain / Port Lokal | Engine | Keterangan |
| :--- | :--- | :--- | :--- |
| **Web Portal (Production)** | `https://asterisk.reycannavaro.dev/` | Nginx &rarr; Astro SSR | Akses dashboard utama |
| **REST API (Production)** | `https://asterisk.reycannavaro.dev/api/v1/` | Nginx &rarr; ElysiaJS | Base endpoint backend |
| **Swagger UI (Production)** | `https://asterisk.reycannavaro.dev/api/v1/swagger` | OpenAPI 3.0 | Dokumentasi API interaktif |
| **Frontend (Local Dev)** | `http://localhost:4321` | Astro TS (SSR) | Server development lokal |
| **Backend (Local Dev)** | `http://localhost:3000` | ElysiaJS (Bun) | API server development lokal |
| **PostgreSQL (Local Dev)** | `localhost:5432` | PostgreSQL 16 Alpine | Database lokal via Docker |
| **Drizzle Studio (Local Dev)** | `http://localhost:4983` | Drizzle Kit Studio | Visual DB manager lokal |

---

## ⚡ Quickstart Commands (`moon`)

Proyek ini menggunakan **[moonrepo (`moon`)](https://moonrepo.dev)** sebagai task runner dan orchestrator monorepo:

```bash
# =======================================================
# 🚀 1. MENJALANKAN DEVELOPMENT SERVER
# =======================================================
# Menjalankan Backend Elysia (Bun watch mode) -> Port 3000
moon run backend:dev

# Menjalankan Frontend Astro TS (HMR aktif) -> Port 4321
moon run frontend:dev

# Menjalankan Frontend dan Backend sekaligus secara paralel
moon run :dev

# =======================================================
# 🗄️ 2. OPERASI DATABASE (Drizzle ORM)
# =======================================================
# Generate migrasi SQL baru dari schema TypeScript:
moon run backend:db:generate

# Terapkan migrasi ke database PostgreSQL:
moon run backend:db:migrate

# Buka Drizzle Studio GUI (Visual Database Inspector) -> Port 4983:
moon run backend:db:studio

# Jalankan database seeder (Default Superadmin & Master Permissions):
moon run backend:db:seed

# =======================================================
# 📦 3. BUILD, TYPECHECK, & LINTING
# =======================================================
# Validasi type-safety TypeScript di seluruh workspace:
moon run :typecheck

# Build production untuk frontend dan backend:
moon run :build

# Linting dan formatting kode:
moon run :lint
```

---

## 📂 Struktur Direktori Workspace

```
asterisk/
├── .moon/                         # Konfigurasi Monorepo Task Runner (Moonrepo)
│   ├── toolchain.yml              # Manajemen runtime (Bun 1.1.x, Node 20.x)
│   └── workspace.yml              # Pemetaan project (backend & frontend)
├── backend/                       # REST API Service (ElysiaJS + Bun)
│   ├── moon.yml                   # Definisi task moon untuk backend
│   ├── src/
│   │   ├── db/                    # Drizzle ORM Schema & Migration scripts
│   │   ├── modules/               # Auth, RBAC, Projects, Vault, Sheets, Tickets
│   │   ├── guards/                # Permission guards & RBAC middleware
│   │   └── index.ts               # Entry point Elysia & Eden Treaty export
│   └── Dockerfile
├── frontend/                      # Web Dashboard Portal (Astro TS + React Islands)
│   ├── moon.yml                   # Definisi task moon untuk frontend
│   ├── src/
│   │   ├── components/            # Shadcn UI & Custom Asterisk Components
│   │   │   ├── sheet/             # Fast-Entry Feedback Table
│   │   │   ├── vault/             # Encrypted Secret Cards with Reveal Timer
│   │   │   └── layout/            # Header dengan Toggle "Showing Mode"
│   │   ├── pages/                 # Astro SSR routing
│   │   └── lib/                   # Eden Treaty API Client
│   └── Dockerfile
├── nginx/                         # Reverse Proxy & SSL Configuration
│   └── conf.d/asterisk.conf       # Nginx config untuk asterisk.reycannavaro.dev
├── docs/                          # Master Architecture & Technical Specifications
│   ├── PRD.md                     # 01. Product Requirement Document & Scope
│   ├── 02-RBAC-and-Security-Spec.md# 02. Dynamic Dual-Tier RBAC & Vault Spec
│   ├── 03-Database-Design-and-ERD.md# 03. Relational Schema PostgreSQL & Drizzle ERD
│   ├── 04-Architecture-and-Deployment.md# 04. AWS EC2, Docker Compose, & Backup Spec
│   ├── 05-API-Contract-and-Eden-Schema.md# 05. Interface Types, Eden Treaty, & Endpoints
│   └── 06-User-Flow-and-Wireframes.md# 06. High-Density UI Wireframes & Showing Mode
├── docker-compose.yml             # Orkestrasi container production (EC2)
└── README.md                      # Dokumentasi utama repositori
```

---

## 📚 Dokumentasi Lengkap Proyek

Seluruh rancangan arsitektur dan spesifikasi teknis tersusun dalam folder [`/docs`](./docs):

1. **[01. Product Requirement Document (PRD) & Scope Boundary](./docs/PRD.md)**  
   *Problem statement, user persona, In-Scope V1 MVP vs Out-of-Scope, dan target KPI operasional.*
2. **[02. Dynamic RBAC Matrix & Security Specification](./docs/02-RBAC-and-Security-Spec.md)**  
   *Matriks izin granular Dev vs Prod, arsitektur brankas kriptografi AES-256-GCM, dan immutable audit logs.*
3. **[03. Database Design & Entity Relationship Diagram (ERD)](./docs/03-Database-Design-and-ERD.md)**  
   *13 tabel PostgreSQL, kamus data lengkap, relasi Drizzle ORM, dan strategi composite indexing.*
4. **[04. Technical Architecture & EC2 Topology Blueprint](./docs/04-Architecture-and-Deployment.md)**  
   *Spesifikasi server EC2 (t4g.small ARM64), konfigurasi Nginx SSL, script backup database otomatis, dan Moonrepo.*
5. **[05. API Contract & Eden Schema (Interface Definition)](./docs/05-API-Contract-and-Eden-Schema.md)**  
   *Spesifikasi TypeBox endpoint ElysiaJS, Eden Treaty client di Astro TS, serta mapping domain `asterisk.reycannavaro.dev`.*
6. **[06. Interactive User Flow & Wireframe Specification](./docs/06-User-Flow-and-Wireframes.md)**  
   *Desain high-density anti-"AI Slop", visualisasi Showing Mode, time-bound reveal timer, dan shortcut keyboard.*

---

## 👨‍💻 Project Lead & Author
- **Rey Cannavaro** — Lead HRIS Project Manager & Solo Developer  
  *Website*: [reycannavaro.dev](https://reycannavaro.dev)
