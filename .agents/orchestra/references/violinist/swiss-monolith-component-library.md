# Swiss Monolith Component Library: Tokens & Layout Architecture

Panduan spesifikasi komponen UI Asterisk berbasis **Swiss Modernism (Anti-Slop)** dan terinspirasi layout kanvas FigCraft `Asterisk_TeamUnity_Style_Dashboard`.

---

## 1. Token Warna Resmi Asterisk

```css
:root {
  /* Surface & Backgrounds */
  --color-canvas-backdrop: #25272D;  /* Dark Graphite Slate */
  --color-shell-surface:   #FFFFFF;  /* Crisp Pure White */
  --color-pod-sidebar:     #18191E;  /* Deep Charcoal Pod */
  --color-card-surface:    #FFFFFF;  /* Card Pure White */
  --color-card-border:     #E5E7EB;  /* Subtle Light Gray Border */
  --color-dashed-slot:     #CBD5E1;  /* Dashed Drop Target Slot */

  /* Primary Brand Accents */
  --color-tangerine-500:   #FF6C22;  /* Brand Primary Orange */
  --color-tangerine-600:   #FF7A29;  /* Hover / Active Orange */
  --color-amber-500:       #F59E0B;  /* Surgical Center Core */

  /* Text & Typography */
  --color-text-primary:    #111827;  /* High Contrast Deep Slate */
  --color-text-secondary:  #6B7280;  /* Cool Gray Secondary */
  --color-text-muted:      #9CA3AF;  /* Muted Placeholder */

  /* Pastel Tag System (Feature Module Tags) */
  --tag-payroll-bg:        #FDE8E4;
  --tag-payroll-text:      #E15B46;

  --tag-attendance-bg:     #E0F7F4;
  --tag-attendance-text:   #0D9488;

  --tag-claim-bg:          #F3E8FF;
  --tag-claim-text:        #7E22CE;

  --tag-security-bg:       #E0F2FE;
  --tag-security-text:     #0284C7;

  --tag-design-bg:         #FEF0E6;
  --tag-design-text:       #D97706;
}
```

---

## 2. Super-Ellipse Border Radius Scale

* **Floating Outer Shell**: `rounded-[32px]`
* **Nested Pod Sidebar**: `rounded-[24px]`
* **Kanban Card**: `rounded-[16px]`
* **Action Pills (Board, + View)**: `rounded-[18px]`
* **Module Tag Pills**: `rounded-[6px]`
* **Date Chip**: `rounded-[6px]`

---

## 3. Komponen Signature: Kanban Drag State Card

Ketika kartu tiket ditarik (*dragging*):
1. **Slot Kosong di Bawahnya (Placeholder)**:
   - Border: `2px dashed var(--color-dashed-slot)`
   - Background: `#FAFAFA`
   - Radius: `16px`
2. **Kartu Melayang (Elevated Card)**:
   - Shadow: `0 20px 35px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)`
   - Grab Indicator: Ikon tangan di pojok kanan atas (`#9CA3AF`).
   - Slight transform offset: `translate(12px, 16px) rotate(0.5deg)`.
