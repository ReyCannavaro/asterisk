import { Elysia, t } from "elysia";
import { db } from "../db";
import { clients, environments } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { scrubSensitiveFields } from "../lib/showing-mask";

export const clientRoutes = new Elysia({ prefix: "/api/clients" })
  .derive(({ headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";
    return { isShowingMode: isShowing };
  })
  // 1. Get all clients with their environment summaries
  .get("/", async ({ isShowingMode }) => {
    try {
      const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
      const allEnvs = await db.select().from(environments);

      const enriched = allClients.map((client) => {
        const clientEnvs = allEnvs.filter((env) => env.clientId === client.id);
        return {
          ...client,
          environments: clientEnvs,
          environmentsCount: clientEnvs.length,
        };
      });

      return scrubSensitiveFields(enriched, isShowingMode);
    } catch {
      // In-memory fallback if database is temporarily unreachable
      const mockClients = [
        { id: "client-adaro", code: "ADARO", name: "PT Adaro Energy Indonesia Tbk", industry: "Energy & Mining", showingAlias: "Client-A (Energy)", isActive: true, environments: [], environmentsCount: 1 },
        { id: "client-mandiri", code: "MANDIRI", name: "PT Bank Mandiri (Persero) Tbk", industry: "Banking & Finance", showingAlias: "Client-B (Banking)", isActive: true, environments: [], environmentsCount: 2 },
        { id: "client-telkomsel", code: "TELKOMSEL", name: "PT Telekomunikasi Selular", industry: "Telecommunications", showingAlias: "Client-C (Telco)", isActive: true, environments: [], environmentsCount: 1 },
        { id: "client-indofood", code: "INDOFOOD", name: "PT Indofood Sukses Makmur Tbk", industry: "Consumer Goods & FMCG", showingAlias: "Client-D (FMCG)", isActive: true, environments: [], environmentsCount: 1 },
      ];
      return scrubSensitiveFields(mockClients, isShowingMode);
    }
  })
  // 2. Get single client detail by ID with environments
  .get("/:id", async ({ params, set, isShowingMode }) => {
    const [client] = await db.select().from(clients).where(eq(clients.id, params.id));
    if (!client) {
      set.status = 404;
      return { error: "Client not found" };
    }
    const envs = await db.select().from(environments).where(eq(environments.clientId, params.id));
    return scrubSensitiveFields({ ...client, environments: envs }, isShowingMode);
  }, {
    params: t.Object({ id: t.String() }),
  })
  // 3. Create a new client
  .post("/", async ({ body, set }) => {
    const clientCode = body.code.toUpperCase().trim();
    const newClient = {
      id: `client-${clientCode.toLowerCase()}`,
      code: clientCode,
      name: body.name.trim(),
      industry: body.industry.trim(),
      showingAlias: body.showingAlias?.trim() || `Client-${clientCode}`,
      logoUrl: body.logoUrl?.trim() || null,
      isActive: body.isActive ?? true,
    };

    const [inserted] = await db.insert(clients).values(newClient).returning();
    set.status = 201;
    return inserted;
  }, {
    body: t.Object({
      code: t.String({ minLength: 2, maxLength: 20 }),
      name: t.String({ minLength: 3 }),
      industry: t.String({ minLength: 2 }),
      showingAlias: t.Optional(t.String()),
      logoUrl: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  // 4. Update an existing client
  .put("/:id", async ({ params, body, set }) => {
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (body.name !== undefined) updatePayload.name = body.name.trim();
    if (body.industry !== undefined) updatePayload.industry = body.industry.trim();
    if (body.showingAlias !== undefined) updatePayload.showingAlias = body.showingAlias.trim();
    if (body.logoUrl !== undefined) updatePayload.logoUrl = body.logoUrl ? body.logoUrl.trim() : null;
    if (body.isActive !== undefined) updatePayload.isActive = body.isActive;

    const [updated] = await db
      .update(clients)
      .set(updatePayload)
      .where(eq(clients.id, params.id))
      .returning();

    if (!updated) {
      set.status = 404;
      return { error: "Client not found" };
    }
    return updated;
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      industry: t.Optional(t.String()),
      showingAlias: t.Optional(t.String()),
      logoUrl: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  // 5. Delete / Deactivate a client
  .delete("/:id", async ({ params, set }) => {
    const [deleted] = await db.delete(clients).where(eq(clients.id, params.id)).returning();
    if (!deleted) {
      set.status = 404;
      return { error: "Client not found" };
    }
    return { success: true, deletedId: deleted.id };
  }, {
    params: t.Object({ id: t.String() }),
  })
  // 6. Get environments for a specific client
  .get("/:id/environments", async ({ params, isShowingMode }) => {
    const envs = await db.select().from(environments).where(eq(environments.clientId, params.id));
    return scrubSensitiveFields(envs, isShowingMode);
  }, {
    params: t.Object({ id: t.String() }),
  })
  // 7. Add an environment to a client
  .post("/:id/environments", async ({ params, body, set }) => {
    const [client] = await db.select().from(clients).where(eq(clients.id, params.id));
    if (!client) {
      set.status = 404;
      return { error: "Client not found" };
    }

    const envName = body.name.toUpperCase().trim();
    const newEnv = {
      id: `env-${client.code.toLowerCase()}-${envName.toLowerCase()}-${Date.now().toString(36)}`,
      clientId: params.id,
      name: envName,
      host: body.host.trim(),
      port: body.port,
      isProtected: body.isProtected ?? false,
    };

    const [inserted] = await db.insert(environments).values(newEnv).returning();
    set.status = 201;
    return inserted;
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.String({ minLength: 2 }),
      host: t.String({ minLength: 3 }),
      port: t.Number({ minimum: 1, maximum: 65535 }),
      isProtected: t.Optional(t.Boolean()),
    }),
  })
  // 8. Delete an environment
  .delete("/environments/:envId", async ({ params, set }) => {
    const [deleted] = await db.delete(environments).where(eq(environments.id, params.envId)).returning();
    if (!deleted) {
      set.status = 404;
      return { error: "Environment not found" };
    }
    return { success: true, deletedId: deleted.id };
  }, {
    params: t.Object({ envId: t.String() }),
  });
