# Showing Mode: Obfuscation Contracts & Anti-Leak Rules

Dokumen kontrak aturan masking dan sensor data untuk fitur **Showing Mode** Asterisk, menjamin tidak ada kredensial sensitif atau rahasia klien yang bocor saat sesi presentasi layar (*screen sharing*).

---

## 1. Matriks Sensor Data Showing Mode

| Jenis Data | Kondisi Normal (Showing OFF) | Kondisi Terproteksi (Showing ON) | Lokasi Sensor |
| :--- | :--- | :--- | :--- |
| **Password Database** | Plaintext (setelah klik reveal & auth) | `••••••••••••` | UI Card & API Response |
| **Connection String** | `postgresql://user:pass@db.adaro.id:5432/hris` | `postgresql://user:••••@adaro-db-masked:****/***` | UI Field & Log Stream |
| **IP Address Host** | `10.240.12.88` atau `172.16.0.4` | `10.240.**.**` | UI Badge & Network Body |
| **Port Server** | `5432`, `22`, `8080` | `****` | UI Badge |
| **Token API Master** | `ak_live_99f8a7bc8102...` | `ak_live_••••••••••••••••` | UI Field |
| **Nama Klien Sensitif** | `PT Adaro Energy Indonesia Tbk` | `Client-Alpha (Mining)` *(Sesuai alias)* | Header & Title |
| **Kompensasi Gaji** | `Rp 45.000.000` | `Rp ••.•••.•••` | Demo Preview Box |

---

## 2. Aturan Middleware Backend Elysia

Ketika header `X-Asterisk-Showing-Mode: 1` diterima server:

```typescript
export function applyShowingMask<T extends Record<string, any>>(data: T, isShowing: boolean): T {
  if (!isShowing) return data;

  const masked = { ...data };

  // Masking password
  if ("password" in masked) masked.password = "••••••••••••";
  if ("encryptedValue" in masked) masked.encryptedValue = "••••••••••••";
  
  // Masking port
  if ("port" in masked) masked.port = 0; // atau divalidasi sebagai masked
  
  // Masking host
  if ("host" in masked && typeof masked.host === "string") {
    masked.host = masked.host.replace(/\d+\.\d+$/, "**.**");
  }

  return masked;
}
```

---

## 3. Global Hotkey Event Listener di Frontend

Frontend wajib mendaftarkan event listener global pada root window:
* Kombinasi: **`Ctrl + Shift + S`** (Windows/Linux) atau **`Cmd + Shift + S`** (macOS).
* Aksi: Membalik nilai boolean `isShowingMode` di global state (Nanostores / React Context).
* Audio/Haptic Feedback: Visual banner toast oranye menyala bertuliskan:  
  `🛡️ SHOWING MODE ACTIVATED - ALL SENSITIVE CREDENTIALS ARE NOW MASKED`.
