# FigCraft Native Node Schema Specification

Dokumen ini adalah spesifikasi teknis format data JSON untuk seluruh tipe node kanvas di dalam berkas arsitektur `.figcraft`.

---

## 1. Node Hierarchy & Types

Seluruh node di FigCraft diturunkan dari `BaseNode` dan memiliki properti `type` yang menentukan kemampuannya:

```typescript
type FigCraftNodeType = 
  | "DOCUMENT"
  | "CANVAS"
  | "FRAME"
  | "GROUP"
  | "TEXT"
  | "VECTOR"
  | "RECTANGLE"
  | "ELLIPSE"
  | "LINE"
  | "COMPONENT"
  | "COMPONENT_SET"
  | "INSTANCE"
  | "BOOLEAN_OPERATION";
```

---

## 2. Definisi Properti Inti Node

### 2.1 Frame Node (`"FRAME"`)
```typescript
interface FigCraftFrameNode {
  id: string;                      // Unique UUIDv4 node identifier
  name: string;                    // Human-readable layer name
  type: "FRAME";
  visible: boolean;
  opacity: number;                 // 0.0 to 1.0
  blendMode: "PASS_THROUGH" | "NORMAL" | "MULTIPLY" | "SCREEN";
  
  // Posisi & Transformasi
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;               // In degrees
  
  // Auto-Layout Engine
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisAlignItems: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems: "MIN" | "CENTER" | "MAX" | "BASELINE";
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  itemSpacing: number;             // Gap antar elemen
  itemReverseZIndex?: boolean;     // Menentukan layer tumpukan (stacking)
  
  // Sizing Rules
  layoutSizingHorizontal: "FIXED" | "HUG" | "FILL";
  layoutSizingVertical: "FIXED" | "HUG" | "FILL";
  
  // Styling Visual
  cornerRadius?: number;           // Uniform radius
  cornerRadii?: [number, number, number, number]; // [TL, TR, BR, BL]
  fills: PaintFill[];
  strokes: StrokePaint[];
  strokeWeight?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
  
  // Pohon Anak
  children: FigCraftNode[];
}
```

### 2.2 Text Node (`"TEXT"`)
```typescript
interface FigCraftTextNode {
  id: string;
  name: string;
  type: "TEXT";
  characters: string;              // Teks yang ditampilkan
  
  // Tipografi
  fontFamily: string;              // Misal: "Geist Sans", "JetBrains Mono"
  fontWeight: 400 | 500 | 600 | 700 | 800;
  fontSize: number;                // Dalam px
  lineHeight?: { value: number; unit: "PIXELS" | "PERCENT" };
  letterSpacing?: { value: number; unit: "PIXELS" | "PERCENT" };
  textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textAlignVertical: "TOP" | "CENTER" | "BOTTOM";
  textCase?: "ORIGINAL" | "UPPERCASE" | "LOWERCASE" | "TITLE";
  
  // Sizing
  layoutSizingHorizontal: "FIXED" | "HUG" | "FILL";
  layoutSizingVertical: "FIXED" | "HUG" | "FILL";
  
  fills: PaintFill[];
}
```

### 2.3 Color & Fill Schema (`PaintFill`)
```typescript
interface PaintFill {
  type: "SOLID" | "GRADIENT_LINEAR" | "IMAGE";
  visible: boolean;
  opacity?: number;
  color?: {
    r: number; // 0.0 to 1.0 (Bukan 0-255)
    g: number;
    b: number;
    a: number;
  };
}
```
*(Catatan: Nilai RGBA pada format node engine FigCraft dikonversi dari Hex ke interval float 0.0 hingga 1.0. Contoh: Hex `#F59E0B` &rarr; `r: 0.9608, g: 0.6196, b: 0.0431, a: 1.0`)*.

