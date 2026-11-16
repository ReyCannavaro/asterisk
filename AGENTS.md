# AGENTS: Asterisk Monorepo Master Router

> **Proyek**: Asterisk (`*`) — Internal Developer Portal, Multi-Client Secrets Vault, Showing Sessions & Feedback Tracker, dan Showing Mode Anti-Leak  
> **Lead Project Manager**: Rey Cannavaro  
> **Arsitektur**: Monorepo Moonrepo (Astro 5 SSR, React 19, Tailwind CSS 4, Elysia.js Bun, Drizzle ORM PostgreSQL, Eden Treaty)

---

## 🎼 1. The Asterisk Orchestra Symphony System

Dalam monorepo ini, AI bekerja sebagai sebuah **Simfoni Orkestra** dengan pembagian peran instrumen khusus. Panduan master orkestrasi diatur dalam 4 dokumen pilar:
- [**`OVERTURE.md`**](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/OVERTURE.md) — Filosofi dasar, 4 motif musikal, dan visi arsitektur Asterisk.
- [**`ORCHESTRATOR.md`**](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/ORCHESTRATOR.md) — Protokol meta-agent dan 4 siklus simfoni (*The 4-Movement Lifecycle*).
- [**`SCORE.md`**](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/SCORE.md) — Partitur alur kerja teknis (*SOP Frontend, Backend, FigCraft, Showing Triage*).
- [**`ARRANGEMENT.md`**](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/ARRANGEMENT.md) — Matriks aransemen pemetaan kebutuhan prompt ke instrumen dan skill.

Setiap kali prompt pengguna masuk, AI wajib menganalisis domain pekerjaan dan membaca file instrumen terkait di folder [`.agents/orchestra/`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/):

| Kategori Prompt | Instrumen Orkestra (*Soloist*) | File Peran | Skill Pendamping Wajib |
| :--- | :--- | :--- | :--- |
| **PM, Sprint, Scope, Showing Triage** | **BATON** | [`.agents/orchestra/BATON.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/BATON.md) | `automation` |
| **Frontend UI, Astro, React, Tailwind, Responsive** | **VIOLINIST** | [`.agents/orchestra/VIOLINIST.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/VIOLINIST.md) | `design-taste-frontend`<br>`responsive-craft` |
| **FigCraft Canvas, Logo, Brandmark, Token Visual** | **ARTIST** | [`.agents/orchestra/ARTIST.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/ARTIST.md) | `figcraft-designer`<br>`high-end-visual-design` |
| **Backend API, Elysia, Bun, Drizzle ORM, PostgreSQL** | **CELLIST** | [`.agents/orchestra/CELLIST.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/CELLIST.md) | `full-output-enforcement`<br>`context7-mcp` |
| **Security, Vault, AES-256-GCM, Showing Mode Masking** | **PERCUSSIONIST** | [`.agents/orchestra/PERCUSSIONIST.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/PERCUSSIONIST.md) | `.agents/rules/user-verification.md` |
| **Analisis Kebutuhan Sistem, Spesifikasi Fitur, Acceptance Criteria** | **FLUTIST** | [`.agents/orchestra/FLUTIST.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/FLUTIST.md) | `context7-mcp` |
| **Integrasi End-to-End, Eden Treaty Type Client** | **HARPIST** | [`.agents/orchestra/HARPIST.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/HARPIST.md) | `full-output-enforcement` |
| **Code Review, Linter, Anti-Slop, Strict Typing** | **TUNER** | [`.agents/orchestra/TUNER.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/TUNER.md) | `react-best-practices` |
| **QA Test, Showing Leak Test, Multi-tenant Isolation** | **AUDITOR** | [`.agents/orchestra/AUDITOR.md`](file:///c:/Users/Rey%20Cannavaro/asterisk/.agents/orchestra/AUDITOR.md) | `browser-use` |

---

## ⚡ 2. Aturan Mutlak Eksekusi (*Non-Negotiable Rules*)

1. **Showing Mode First (Zero Data Leak)**:
   - Setiap kali menampilkan atau memproses data kredensial (host, port, DB password, token API), pastikan ada mekanisme sensor Showing Mode (`••••••••••••`).
   - Jangan pernah mencetak plaintext credentials di log konsol atau response publik.

2. **Anti-Slop Design (The Swiss Monolith)**:
   - Dilarang membuat antarmuka generik AI dengan gradien ungu/pink gonjreng atau drop shadow kartun.
   - Wajib mengikuti palet resmi Asterisk: *Carbon Obsidian (#06080D), Charcoal (#18191E), Slate (#25272D), Tangerine Orange (#FF6C22), dan Amber (#F59E0B)* dengan layout super-ellipse halus (*TeamUnity Style*).

3. **Full Output Enforcement**:
   - Dilarang memotong kode dengan placeholder malas (`// ... rest of code`, `// TODO`). Seluruh file yang diedit/dibuat wajib ditulis secara utuh dan siap jalan.

4. **Kepatuhan Kontrol Server (User Verification Directive)**:
   - **DILARANG menjalankan background dev server (`moon run :dev`, `bun dev`, `npm start`) secara otonom**.
   - Server proses dikendalikan sepenuhnya oleh pengguna di terminalnya sendiri. Agent hanya membuat kode, memverifikasi linter/typecheck, dan mempersiapkan build.


<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions take precedence.

## Context

### Terminology:
- Say "project" instead of "account" — a project contains an AWS account and settings for sharing with other collaborators
- Say "team member" instead of "IAM user" — users are invited by email, not created or federated in IAM
- Say "AWS Settings" when referring to management tasks at [settings.aws.com](https://settings.aws.com/) (project management, billing, team members, spend limits). Users view their actual AWS resources in the AWS Management Console.
- Say "selected Region" when referring to the user's Region — not "home Region"
- The user has a managed IAM experience. This includes managed service control policies (SCP) and resource control policies (RCP) that govern the use of AWS.

### Constraints:
- All projects share a single AWS Region (`ap-southeast-2`). Resources cannot be created in other Regions.
- MUST create all Regional resources in the project's assigned Region (`ap-southeast-2`).
- The user sets up billing, creates spend limits, and retrieves and pays invoices in AWS Settings.
- For any AWS task or question, use skills and AWS MCP tools when available.

### Help level:
- Default help level is HIGH: Explain what each step does, suggest best practices, and flag security/cost considerations.
<!-- END AWS Agent Toolkit rules -->
