import { Elysia, t } from "elysia";
import { db } from "../db";
import { credentials, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { vault } from "../lib/vault";
import { scrubSensitiveFields } from "../lib/showing-mask";

export const vaultRoutes = new Elysia({ prefix: "/api/vault" })
  .derive(({ headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";
    return { isShowingMode: isShowing };
  })
  .get("/", async ({ isShowingMode }) => {
    try {
      const data = await db.select().from(credentials);
      return scrubSensitiveFields(data, isShowingMode);
    } catch {
      const mockCreds = [
        { id: "cr1", environmentId: "e1", type: "POSTGRES_PASSWORD", name: "DB Staging Password", encryptedValue: "iv:ciphertext:tag", keyVersion: 1 },
        { id: "cr2", environmentId: "e1", type: "API_MASTER_TOKEN", name: "Adaro Generator Master Key", encryptedValue: "iv:ciphertext:tag", keyVersion: 1 },
      ];
      return scrubSensitiveFields(mockCreds, isShowingMode);
    }
  })
  .post("/encrypt", ({ body }) => {
    const encrypted = vault.encrypt(body.plaintext);
    return {
      name: body.name,
      type: body.type,
      encryptedValue: encrypted,
    };
  }, {
    body: t.Object({
      name: t.String(),
      type: t.String(),
      plaintext: t.String(),
    }),
  })
  .post("/decrypt", async ({ body, isShowingMode, set }) => {
    if (isShowingMode) {
      set.status = 403;
      return {
        error: "FORBIDDEN_SHOWING_MODE",
        message: "Cannot reveal credentials while Showing Mode is active (Ctrl+Shift+S).",
      };
    }
    try {
      const decrypted = vault.decrypt(body.encryptedValue);
      return { plaintext: decrypted };
    } catch (err: any) {
      set.status = 400;
      return { error: "DECRYPTION_FAILED", message: err.message };
    }
  }, {
    body: t.Object({
      encryptedValue: t.String(),
    }),
  });
