import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit recommended for GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

export class AsteriskVault {
  private masterKey: Buffer;

  constructor(masterKeyHex?: string) {
    // Default fallback 32-byte key for local dev if not supplied in env
    const defaultKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const keyString = masterKeyHex || process.env.VAULT_MASTER_KEY || defaultKey;
    if (keyString.length !== 64) {
      throw new Error("VAULT_MASTER_KEY must be a 64-character (32-byte) hex string.");
    }
    this.masterKey = Buffer.from(keyString, "hex");
  }

  /**
   * Mengenkripsi plaintext credential
   * Format: iv_hex:ciphertext_hex:auth_tag_hex
   */
  public encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv, { authTagLength: TAG_LENGTH });

    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

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

export const vault = new AsteriskVault();
