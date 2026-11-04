# Design Token Architecture for Asterisk (`*`) in FigCraft

Panduan standar untuk mendeklarasikan dan menerapkan token desain Asterisk ke dalam variabel kanvas FigCraft.

---

## 1. Skala Warna Taktikal (*Tactical Dark Console*)

```
[ Canvas Root ] #080B11
     ├── [ Surface Base ] #0F172A
     │        ├── [ Elevated Card ] #1E293B
     │        │        └── [ Active / Focus Highlight ] #334155
     └── [ Accent Layer ]
              ├── Amber Asterisk: #F59E0B (Brand Core, Pending, Warning)
              ├── Emerald Terminal: #10B981 (QA Verified, Server Online, Success)
              ├── Cyan Debug: #38BDF8 (Ports, Branches, Technical Identifiers)
              └── Crimson Alert: #EF4444 (Blocker, Bug, Error, Disconnect)
```

---

## 2. Tabel Pemetaan Variabel FigCraft

| Nama Token FigCraft | Nilai Hex | Alpha | Peran Semantik di UI Asterisk |
| :--- | :---: | :---: | :--- |
| `color/bg/canvas` | `#080B11` | 100% | Latar belakang viewport utama aplikasi |
| `color/bg/sidebar` | `#0B0F19` | 100% | Latar belakang navigasi menu kiri |
| `color/bg/card` | `#0F172A` | 100% | Kartu ringkasan metrik, header table, modal |
| `color/bg/card-elevated`| `#1E293B` | 100% | Baris tabel saat hover, cell terfokus |
| `color/border/subtle` | `#1E293B` | 60% | Garis batas antar baris tabel feedback |
| `color/border/strong` | `#334155` | 100% | Garis batas kartu vault dan frame utama |
| `color/text/primary` | `#F8FAFC` | 100% | Judul, angka metrik, label utama |
| `color/text/secondary` | `#94A3B8` | 100% | Sub-label, keterangan field, nama klien |
| `color/text/muted` | `#64748B` | 100% | Timestamp, breadcrumbs, placeholder |
| `color/accent/brand` | `#F59E0B` | 100% | Logo Asterisk `*`, tombol utama, Showing Mode |
| `color/accent/tech` | `#38BDF8` | 100% | Port generator `:3001`, branch git, IP host |
| `color/accent/success` | `#10B981` | 100% | Status QA Approved, status live prod |
| `color/accent/danger` | `#EF4444` | 100% | Bug blocker, tombol hapus secret |

---

## 3. Tipografi & Font-Family

- **Primary UI Text:** `Geist Sans` (atau `Inter` sebagai fallback).
  - Skala: 11px (Micro), 13px (Body), 15px (Subhead), 20px (Heading), 28px (Title).
- **Technical & Data Display:** `JetBrains Mono` (atau `Fira Code`).
  - Digunakan untuk: Port generator, IP host, commit hash, UUID, timestamp log audit, password masking `* * * * * *`.
  - Properti wajib: Tabular Figures aktif (`tnum` / `font-variant-numeric: tabular-nums`).

---

## 4. Spacing, Corner Radius, & Elevation

- **Spasi Skala Modular:** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`.
- **Corner Radius:**
  - `Badge / Pill`: 4px (atau `9999px` untuk fully rounded pill).
  - `Input / Button`: 6px.
  - `Card / Modal`: 8px.
  - `Root Frame`: 0px.
- **Elevation / Shadow:** Hindari drop-shadow blur tebal (AI Slop). Gunakan **1px stroke border hairline** + bayangan tipis terarah:
  - `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.4)`

