# SKILL ROUTER: Matriks Pemetaan Kebutuhan ke Skill

Gunakan tabel matriks di bawah ini untuk menentukan skill mana di folder `.agents/skills/` yang **wajib di-load (`view_file`)** sebelum memulai pekerjaan:

---

## 1. Matriks Routing Otomatis

| Kategori Tugas | Kata Kunci / Konteks | Skill yang Wajib Diaktifkan | Path Skill |
| :--- | :--- | :--- | :--- |
| **Frontend UI Baru** | Membuat halaman baru, komponen visual, hero section, card, navigasi | `design-taste-frontend`<br>`high-end-visual-design`<br>`responsive-craft` | `.agents/skills/design-taste-frontend/SKILL.md`<br>`.agents/skills/high-end-visual-design/SKILL.md`<br>`.agents/skills/responsive-craft/SKILL.md` |
| **Responsif & Mobile Layout** | Tampilan HP, cascading dropdown, responsive preview, drawer mobile | `responsive-craft` | `.agents/skills/responsive-craft/SKILL.md` |
| **Gaya Desain Spesifik** | Brutalist, minimalis, editorial, tema modern tanpa gradient | `minimalist-ui`<br>atau `industrial-brutalist-ui` | `.agents/skills/minimalist-ui/SKILL.md`<br>`.agents/skills/industrial-brutalist-ui/SKILL.md` |
| **Penulisan Kode Lengkap** | Backend Elysia, query DB, form handling, API client Eden | `full-output-enforcement` | `.agents/skills/full-output-enforcement/SKILL.md` |
| **Dokumentasi Library & Framework** | API reference Vite, React 19, Elysia, Drizzle ORM, Leaflet | `context7-mcp` | `.agents/skills/context7-mcp/SKILL.md` |
| **Scraping Data & Testing Browser** | Ekstraksi web MBG Watch, pengujian interaksi peta, form check-in | `browser-use` | `.agents/skills/browser-use/SKILL.md` |
| **Aset Visual & Branding** | Pembuatan logo, identity board, mockups, banner visual | `brandkit`<br>`imagegen-frontend-web` | `.agents/skills/brandkit/SKILL.md`<br>`.agents/skills/imagegen-frontend-web/SKILL.md` |
| **Ekstraksi Desain & FigCraft Canvas** | Ekstrak gambar referensi, desain kanvas FigCraft, Auto-Layout tree, node JSON | `figcraft-designer` | `.agents/skills/figcraft-designer/SKILL.md` |
| **Image-to-Code** | Menerjemahkan mockup gambar menjadi komponen React/Tailwind | `image-to-code` | `.agents/skills/image-to-code/SKILL.md` |
| **Riset Data & Verifikasi Sumber** | Penelusuran data BGN, verifikasi berita MBG, validasi fakta | `valyu-best-practices` | `.agents/skills/valyu-best-practices/SKILL.md` |

---

## 2. Aturan Kombinasi Skill (*Chaining Rules*)

1. **Ketika mengerjakan Frontend:**  
   Wajib mengombinasikan `design-taste-frontend` (untuk estetika & anti-slop) + `responsive-craft` (untuk memastikan mobile breakpoint berfungsi sempurna).
2. **Ketika menulis file TypeScript/React panjang:**  
   Wajib menerapkan aturan dari `full-output-enforcement` agar tidak ada fungsi yang dipotong di tengah jalan.
3. **Ketika membuat fitur peta interaktif:**  
   Gunakan `context7-mcp` untuk memastikan sintaks Leaflet/MapLibre sesuai versi terbaru React, lalu uji tampilannya via `browser-use`.
