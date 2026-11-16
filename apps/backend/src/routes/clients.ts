import { Elysia, t } from "elysia";
import { db } from "../db";
import { clients, environments } from "../db/schema";
import { eq } from "drizzle-orm";
import { scrubSensitiveFields } from "../lib/showing-mask";

export const clientRoutes = new Elysia({ prefix: "/api/clients" })
  .derive(({ headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";
    return { isShowingMode: isShowing };
  })
  .get("/", async ({ isShowingMode }) => {
    try {
      const data = await db.select().from(clients);
      return scrubSensitiveFields(data, isShowingMode);
    } catch {
      // In-memory fallback if DB not running locally
      const mockClients = [
        { id: "c1", code: "ADARO", name: "PT Adaro Energy Tbk", industry: "MINING", showingAlias: "Client-Alpha", isActive: true },
        { id: "c2", code: "MANDIRI", name: "PT Bank Mandiri (Persero) Tbk", industry: "BANKING", showingAlias: "Client-Beta", isActive: true },
        { id: "c3", code: "TELKOMSEL", name: "PT Telkomsel Indonesia", industry: "TELCO", showingAlias: "Client-Gamma", isActive: true },
        { id: "c4", code: "INDOFOOD", name: "PT Indofood Sukses Makmur Tbk", industry: "FMCG", showingAlias: "Client-Delta", isActive: true },
      ];
      return scrubSensitiveFields(mockClients, isShowingMode);
    }
  })
  .get("/:id/environments", async ({ params, isShowingMode }) => {
    try {
      const envs = await db.select().from(environments).where(eq(environments.clientId, params.id));
      return scrubSensitiveFields(envs, isShowingMode);
    } catch {
      const mockEnvs = [
        { id: "e1", clientId: params.id, name: "DEVELOPMENT", host: "10.240.10.12", port: 5432, isProtected: false },
        { id: "e2", clientId: params.id, name: "STAGING", host: "10.240.10.14", port: 5432, isProtected: true },
        { id: "e3", clientId: params.id, name: "PRODUCTION", host: "172.16.4.88", port: 5432, isProtected: true },
      ];
      return scrubSensitiveFields(mockEnvs, isShowingMode);
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
  });
