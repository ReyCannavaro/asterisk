# AES-256-GCM Vault: Cryptographic Specification & Implementation

Dokumen spesifikasi teknis resmi untuk modul Credential Vault Asterisk menggunakan algoritma **AES-256-GCM (Galois/Counter Mode)** dengan integritas data berbasis authenticated tag.

---

## 1. Parameter Kriptografi Resmi

* **Cipher**: `AES-256-GCM`
* **Key Length**: 256 bits (32 bytes)
* **Initialization Vector (IV)**: 96 bits (12 bytes) — *wajib dihasilkan menggunakan cryptographically secure random number generator (CSPRNG) untuk setiap enkripsi.*
* **Authentication Tag Length**: 128 bits (16 bytes)
* **Output Serialization Format**: `iv_hex:ciphertext_hex:auth_tag_hex`

---

## 2. Implementasi Kriptografi di Bun / Node.js

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit recommended for GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

interface EncryptedPayload {
  serialized: string; // "iv:ciphertext:tag"
}

export class AsteriskVault {
  private masterKey: Buffer;

  constructor(masterKeyHex?: string) {
    const keyString = masterKeyHex || process.env.VAULT_MASTER_KEY;
    if (!keyString || keyString.length !== 64) {
      throw new Error("VAULT_MASTER_KEY must be a 64-character (32-byte) hex string.");
    }
    this.masterKey = Buffer.from(keyString, "hex");
  }

  /**
   * Mengenkripsi plaintext credential
   */
  public encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv, { authTagLength: TAG_LENGTH });

    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Serialize: iv:ciphertext:tag (semua dalam hex)
    return `${iv.toString("hex")}:${encrypted.toString("hex")}:${authTag.toString("hex")}`;
  }

  /**
   * Mendekripsi payload serialized
   */
  public decrypt(serialized: string): string {
    const parts = serialized.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted payload format. Expected 'iv:ciphertext:tag'");
    }

    const [ivHex, ciphertextHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, this.masterKey, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  }
}
```

---

## 3. Protokol Anti-Tampering & Keamanan Kunci

1. **Anti-Replay & Nonce Collision**:
   - Dilarang keras menggunakan IV yang sama dua kali dengan Master Key yang sama. Menggunakan IV berulang pada AES-GCM merusak keamanan dan memungkinkan pemulihan plaintext.
2. **Autentikasi Integritas**:
   - Jika ciphertext atau tag dirusak atau diubah (bahkan 1 bit), `decipher.final()` akan langsung melempar error `Unsupported state or unable to authenticate data`.
3. **Penyimpanan Memory & Garbage Collection**:
   - String plaintext didekripsi hanya saat dibutuhkan untuk koneksi atau aksi user yang diotorisasi, dan segera dilepas dari referensi variabel agar di-*garbage collect*.
