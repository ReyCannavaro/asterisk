import { Elysia, t } from "elysia";
import { db } from "../db";
import { roles, permissions, rolePermissions, clients, users, userRoles, auditLogs } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { SYSTEM_NAV_CATALOG, filterNavigationForUser } from "../lib/rbac";
import { scrubSensitiveFields } from "../lib/showing-mask";
import type { UserSessionProfile, SidebarConfig } from "@asterisk/types";

export const roleRoutes = new Elysia({ prefix: "/api" })
  .derive(({ headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";

    // Current session mock / resolver (defaults to Superadmin Rey Cannavaro)
    const currentUser: UserSessionProfile = {
      id: "user-rey-superadmin",
      email: "rey@asterisk.internal",
      fullName: "Rey Cannavaro",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      isSuperadmin: true,
      roles: [{ id: "ur-1", userId: "user-rey-superadmin", roleId: "SUPERADMIN", roleName: "Superadministrator", clientId: null }],
      permissions: [], // Superadmin bypasses permission checks
      accessibleClientIds: [],
    };
    return { currentUser, isShowingMode: isShowing };
  })

  // 1. GET /api/me/navigation - Dynamic Sidebar Config
  .get("/me/navigation", async ({ currentUser, isShowingMode }) => {
    const menuItems = filterNavigationForUser(currentUser);

    let clientItems: SidebarConfig["activeClients"] = [];
    try {
      const dbClients = await db.select().from(clients);
      clientItems = dbClients.map((c) => ({
        id: c.id,
        code: c.code,
        name: isShowingMode && c.showingAlias ? c.showingAlias : c.name,
        showingAlias: c.showingAlias ?? undefined,
        activeTasksCount: 3,
        healthStatus: "HEALTHY",
      }));
    } catch {
      clientItems = [
        { id: "c1", code: "ADARO", name: isShowingMode ? "Client-A (Energy)" : "PT Adaro Energy Tbk", activeTasksCount: 4, healthStatus: "HEALTHY" },
        { id: "c2", code: "MANDIRI", name: isShowingMode ? "Client-B (Banking)" : "PT Bank Mandiri (Persero) Tbk", activeTasksCount: 7, healthStatus: "HEALTHY" },
        { id: "c3", code: "TELKOMSEL", name: isShowingMode ? "Client-C (Telco)" : "PT Telkomsel Indonesia", activeTasksCount: 2, healthStatus: "ATTENTION" },
        { id: "c4", code: "INDOFOOD", name: isShowingMode ? "Client-D (FMCG)" : "PT Indofood Sukses Makmur Tbk", activeTasksCount: 1, healthStatus: "HEALTHY" },
      ];
    }

    const response: SidebarConfig = {
      menuItems,
      activeClients: clientItems,
      currentUser: {
        fullName: currentUser.fullName,
        initials: "RC",
        roleLabel: currentUser.isSuperadmin ? "Superadministrator" : "Member",
        isSuperadmin: currentUser.isSuperadmin,
        isOnline: true,
      },
    };

    return response;
  })

  // 2. GET /api/permissions - Catalog of all granular permissions
  .get("/permissions", async () => {
    try {
      return await db.select().from(permissions);
    } catch {
      return [];
    }
  })

  // 3. GET /api/roles - List all dynamic roles with permissions
  .get("/roles", async () => {
    try {
      const allRoles = await db.select().from(roles);
      const allRolePerms = await db.select().from(rolePermissions);

      return allRoles.map((r) => {
        const perms = allRolePerms
          .filter((rp) => rp.roleId === r.id)
          .map((rp) => rp.permissionId);
        return {
          ...r,
          permissions: perms,
        };
      });
    } catch {
      return [];
    }
  })

  // 4. POST /api/roles - Create custom dynamic role
  .post("/roles", async ({ body, currentUser, set }) => {
    try {
      const newRoleId = `role-${crypto.randomUUID().slice(0, 8)}`;
      await db.insert(roles).values({
        id: newRoleId,
        name: body.name.trim(),
        description: body.description?.trim() ?? null,
        isSystem: false,
      });

      if (body.permissions && body.permissions.length > 0) {
        for (const p of body.permissions) {
          await db.insert(rolePermissions).values({
            roleId: newRoleId,
            permissionId: p,
          });
        }
      }

      set.status = 201;
      return { success: true, id: newRoleId, name: body.name };
    } catch (err: any) {
      set.status = 500;
      return { error: "CREATE_ROLE_FAILED", message: err.message };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 3 }),
      description: t.Optional(t.String()),
      permissions: t.Array(t.String()),
    }),
  })

  // 5. PUT /api/roles/:id - Update dynamic role permissions
  .put("/roles/:id", async ({ params, body, set }) => {
    try {
      await db.update(roles)
        .set({ name: body.name.trim(), description: body.description?.trim() ?? null })
        .where(eq(roles.id, params.id));

      // Refresh role permissions
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, params.id));
      if (body.permissions && body.permissions.length > 0) {
        for (const p of body.permissions) {
          await db.insert(rolePermissions).values({
            roleId: params.id,
            permissionId: p,
          });
        }
      }

      return { success: true, id: params.id };
    } catch (err: any) {
      set.status = 500;
      return { error: "UPDATE_ROLE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      permissions: t.Array(t.String()),
    }),
  })

  // 6. DELETE /api/roles/:id - Delete custom role (cannot delete system role)
  .delete("/roles/:id", async ({ params, set }) => {
    try {
      const [targetRole] = await db.select().from(roles).where(eq(roles.id, params.id));
      if (!targetRole) {
        set.status = 404;
        return { error: "Role not found" };
      }

      if (targetRole.isSystem) {
        set.status = 400;
        return { error: "Cannot delete protected system role" };
      }

      await db.delete(roles).where(eq(roles.id, params.id));
      return { success: true, deletedId: params.id };
    } catch (err: any) {
      set.status = 500;
      return { error: "DELETE_ROLE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 7. GET /api/users - List users with assigned roles & tenant scopes
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      const allRoles = await db.select().from(roles);
      const allUserRoles = await db.select().from(userRoles);
      const allClients = await db.select().from(clients);

      return allUsers.map((u) => {
        const assignments = allUserRoles
          .filter((ur) => ur.userId === u.id)
          .map((ur) => {
            const role = allRoles.find((r) => r.id === ur.roleId);
            const client = ur.clientId ? allClients.find((c) => c.id === ur.clientId) : undefined;
            return {
              id: ur.id,
              roleId: ur.roleId,
              roleName: role?.name ?? ur.roleId,
              clientId: ur.clientId,
              clientName: client?.name ?? undefined,
            };
          });

        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          isSuperadmin: u.isSuperadmin,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
          assignedRoles: assignments,
        };
      });
    } catch {
      return [
        {
          id: "user-rey-superadmin",
          email: "rey@asterisk.internal",
          fullName: "Rey Cannavaro",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          isSuperadmin: true,
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          assignedRoles: [
            {
              id: "ur-1",
              roleId: "SUPERADMIN",
              roleName: "Superadministrator",
              clientId: null,
            },
          ],
        },
      ];
    }
  })

  // 8. POST /api/users - Invite or create user
  .post("/users", async ({ body, set }) => {
    try {
      const newUserId = `user-${crypto.randomUUID().slice(0, 8)}`;
      const newUser = {
        id: newUserId,
        email: body.email.trim().toLowerCase(),
        passwordHash: "$argon2id$mocked_hash_for_dev",
        fullName: body.fullName.trim(),
        avatarUrl: body.avatarUrl?.trim() || null,
        isSuperadmin: body.isSuperadmin || false,
        isActive: true,
      };

      const [inserted] = await db.insert(users).values(newUser).returning();

      // Assign initial role
      if (body.roleId) {
        await db.insert(userRoles).values({
          id: `ur-${crypto.randomUUID().slice(0, 8)}`,
          userId: newUserId,
          roleId: body.roleId,
          clientId: body.clientId || null,
        });
      }

      set.status = 201;
      return {
        ...inserted,
        createdAt: inserted.createdAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "CREATE_USER_FAILED", message: err.message };
    }
  }, {
    body: t.Object({
      email: t.String(),
      fullName: t.String({ minLength: 2 }),
      avatarUrl: t.Optional(t.String()),
      isSuperadmin: t.Optional(t.Boolean()),
      roleId: t.Optional(t.String()),
      clientId: t.Optional(t.String()),
    }),
  })

  // 9. POST /api/users/:id/roles - Assign role with optional client tenant scope
  .post("/users/:id/roles", async ({ params, body, set }) => {
    try {
      const assignmentId = `ur-${crypto.randomUUID().slice(0, 8)}`;
      const [inserted] = await db.insert(userRoles).values({
        id: assignmentId,
        userId: params.id,
        roleId: body.roleId,
        clientId: body.clientId || null,
      }).returning();

      set.status = 201;
      return inserted;
    } catch (err: any) {
      set.status = 500;
      return { error: "ASSIGN_ROLE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      roleId: t.String(),
      clientId: t.Optional(t.String()),
    }),
  })

  // 10. DELETE /api/users/:id/roles/:roleAssignmentId - Remove role assignment
  .delete("/users/:id/roles/:roleAssignmentId", async ({ params, set }) => {
    try {
      await db.delete(userRoles).where(eq(userRoles.id, params.roleAssignmentId));
      return { success: true, deletedId: params.roleAssignmentId };
    } catch (err: any) {
      set.status = 500;
      return { error: "REMOVE_ROLE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String(), roleAssignmentId: t.String() }),
  })

  // 11. GET /api/audit - Security Audit Log Explorer
  .get("/audit", async ({ query, isShowingMode }) => {
    try {
      const allLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
      const allUsers = await db.select().from(users);

      let enriched = allLogs.map((log) => {
        const u = log.userId ? allUsers.find((user) => user.id === log.userId) : undefined;
        return {
          ...log,
          createdAt: log.createdAt ? log.createdAt.toISOString() : new Date().toISOString(),
          userFullName: u?.fullName ?? "Rey Cannavaro",
          userEmail: u?.email ?? "rey@asterisk.internal",
          ipAddress: isShowingMode ? "10.240.**.**" : log.ipAddress,
        };
      });

      if (query.action) {
        enriched = enriched.filter((l) => l.action === query.action);
      }

      if (query.resourceType) {
        enriched = enriched.filter((l) => l.resourceType === query.resourceType);
      }

      return scrubSensitiveFields(enriched, isShowingMode);
    } catch {
      return [
        {
          id: "audit-01",
          userId: "user-rey-superadmin",
          action: "VAULT_DECRYPT",
          resourceType: "CREDENTIAL",
          resourceId: "cred-adaro-db",
          ipAddress: isShowingMode ? "10.240.**.**" : "127.0.0.1",
          userAgent: "Mozilla/5.0 Asterisk-Client",
          wasShowingModeActive: false,
          metadata: { name: "Adaro HRIS PostgreSQL Dev Password" },
          createdAt: new Date().toISOString(),
          userFullName: "Rey Cannavaro",
          userEmail: "rey@asterisk.internal",
        },
      ];
    }
  }, {
    query: t.Object({
      action: t.Optional(t.String()),
      resourceType: t.Optional(t.String()),
    }),
  })

  // 12. GET /api/audit/stats - Security Summary Metrics
  .get("/audit/stats", async () => {
    try {
      const allLogs = await db.select().from(auditLogs);
      const totalEvents = allLogs.length;
      const decryptions = allLogs.filter((l) => l.action === "VAULT_DECRYPT").length;
      const showingToggles = allLogs.filter((l) => l.action.includes("SHOWING")).length;
      const secretChanges = allLogs.filter((l) => l.action.startsWith("VAULT_") && l.action !== "VAULT_DECRYPT").length;

      return {
        totalEvents,
        decryptions,
        showingToggles,
        secretChanges,
      };
    } catch {
      return {
        totalEvents: 4,
        decryptions: 1,
        showingToggles: 2,
        secretChanges: 1,
      };
    }
  });
