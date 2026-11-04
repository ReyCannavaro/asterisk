# FigCraft Auto-Layout Engine Specification

Dokumen referensi teknis ini menjelaskan aturan perhitungan dan formulasi tata letak otomatis (*Auto-Layout*) pada kanvas FigCraft.

---

## 1. Dimensional Sizing Axes (Horizontal & Vertical)

Setiap node di dalam frame Auto-Layout FigCraft memiliki dua sumbu ukuran independen:
- **Horizontal Sizing (`layoutSizingHorizontal`)**
- **Vertical Sizing (`layoutSizingVertical`)**

| Mode Sizing | Nilai Teknis | Perilaku Desain | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **`HUG`** | `"HUG"` | Lebar/Tinggi frame membungkus pas seluruh anak elemennya (*content-driven*). | Tombol, Pill Badge, Chip Status, Dropdown trigger. |
| **`FILL`** | `"FILL"` | Melebar/Meninggi mengikuti ruang tersisa dari frame induk (*container-driven*). | Search input, kolom tabel, wrapper kartu dashboard, hero content. |
| **`FIXED`** | `"FIXED"` | Ukuran statis dalam satuan pixel (px). | Icon frame (`16x16`, `24x24`), Avatar, Sidebar width (`240px`). |

---

## 2. Axis Alignment & Distribution Formulation

FigCraft menggunakan dua sumbu koordinat:
1. **Primary Axis (`primaryAxisAlignItems`):** Sumbu utama aliran layout.
   - Jika `layoutMode == "HORIZONTAL"`, sumbu utama adalah horizontal (X).
   - Jika `layoutMode == "VERTICAL"`, sumbu utama adalah vertikal (Y).
2. **Counter Axis (`counterAxisAlignItems`):** Sumbu tegak lurus terhadap sumbu utama.

### Nilai Distribusi:
- **`MIN`**: Elemen menempel di awal (Left / Top).
- **`CENTER`**: Elemen berada di tengah sumbu.
- **`MAX`**: Elemen menempel di akhir (Right / Bottom).
- **`SPACE_BETWEEN`**: Elemen pertama menempel di awal, elemen terakhir menempel di akhir, elemen tengah terbagi rata secara otomatis.

---

## 3. Padding & Item Spacing Calculation

Untuk menjaga ritme modular 4px/8px:
- **Padding:** Dinyatakan dalam 4 sisi `[paddingTop, paddingRight, paddingBottom, paddingLeft]`.
- **Item Spacing (`gap`):** Jarak antar node anak di dalam frame.
- **Negative Spacing (Overlap):** FigCraft mendukung `itemSpacing < 0` (misal `-8px`) untuk tumpukan avatar pengguna (*Avatar Group*).

---

## 4. Nested Table Row Auto-Layout Blueprint

Berikut rumus Auto-Layout untuk baris tabel **Asterisk Sheet**:

```
FRAME: "TableRow_Feedback" (Width: FILL, Height: HUG, Layout: HORIZONTAL, Align: CENTER, Padding: [12, 16], Gap: 12)
├── TEXT: "Col_ID" (Width: FIXED 36px, Align: CENTER, Font: Mono)
├── FRAME: "Col_Module" (Width: FIXED 110px, Layout: HORIZONTAL)
│   └── INSTANCE: "Badge_Module" (Sizing: HUG)
├── FRAME: "Col_Type" (Width: FIXED 90px, Layout: HORIZONTAL)
│   └── INSTANCE: "Badge_Type" (Sizing: HUG)
├── TEXT: "Col_Note" (Width: FILL, Height: HUG, Truncate: Ellipsis atau Wrap)
├── FRAME: "Col_Status" (Width: FIXED 100px, Layout: HORIZONTAL)
│   └── INSTANCE: "Badge_Status" (Sizing: HUG)
└── FRAME: "Col_Action" (Width: FIXED 120px, Layout: HORIZONTAL, Align: RIGHT)
    └── INSTANCE: "Button_ConvertTicket" (Sizing: HUG)
```

