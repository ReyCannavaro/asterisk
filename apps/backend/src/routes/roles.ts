import { Elysia, t } from "elysia";
import { db } from "../db";
import { roles, permissions, rolePermissions, clients, tasks } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { SYSTEM_NAV_CATALOG, filterNavigationForUser } from "../lib/rbac";
import type { UserSessionProfile, SidebarConfig, StandardPermission } from "@asterisk/types";

export const roleRoutes = new Elysia({ prefix: "/api" })
  // Current session mock / resolver (defaults to Superadmin Rey Cannavaro)
  .derive(() => {
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
    return { currentUser };
  })

  // 1. GET /api/me/navigation - Dynamic Sidebar Config
  .get("/me/navigation", async ({ currentUser, headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";

    // Dynamic menu items filtered by user permissions
    const menuItems = filterNavigationForUser(currentUser);

    // Dynamic active clients query
    let clientItems: SidebarConfig["activeClients"] = [];
    try {
      const dbClients = await db.select().from(clients);
      clientItems = dbClients.map((c) => ({
        id: c.id,
        code: c.code,
        name: isShowing && c.showingAlias ? c.showingAlias : c.name,
        showingAlias: c.showingAlias ?? undefined,
        activeTasksCount: 3,
        healthStatus: "HEALTHY",
      }));
    } catch {
      // Fallback
      clientItems = [
        { id: "c1", code: "ADARO", name: isShowing ? "Client-A (Energy)" : "PT Adaro Energy Tbk", activeTasksCount: 4, healthStatus: "HEALTHY" },
        { id: "c2", code: "MANDIRI", name: isShowing ? "Client-B (Banking)" : "PT Bank Mandiri (Persero) Tbk", activeTasksCount: 7, healthStatus: "HEALTHY" },
        { id: "c3", code: "TELKOMSEL", name: isShowing ? "Client-C (Telco)" : "PT Telkomsel Indonesia", activeTasksCount: 2, healthStatus: "ATTENTION" },
        { id: "c4", code: "INDOFOOD", name: isShowing ? "Client-D (FMCG)" : "PT Indofood Sukses Makmur Tbk", activeTasksCount: 1, healthStatus: "HEALTHY" },
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
  .post("/roles", async ({ body, currentUser }) => {
    if (!currentUser.isSuperadmin && !currentUser.permissions.includes("roles:create")) {
      throw new Error("403 Forbidden: Only administrators can create roles");
    }

    const newRoleId = `role-${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(roles).values({
      id: newRoleId,
      name: body.name,
      description: body.description ?? null,
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

    return { success: true, id: newRoleId, name: body.name };
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      permissions: t.Array(t.String()),
    }),
  })

  // 5. PUT /api/roles/:id - Update dynamic role permissions
  .put("/roles/:id", async ({ params, body, currentUser }) => {
    if (!currentUser.isSuperadmin && !currentUser.permissions.includes("roles:update")) {
      throw new Error("403 Forbidden: Only administrators can update roles");
    }

    await db.update(roles)
      .set({ name: body.name, description: body.description ?? null })
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
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      permissions: t.Array(t.String()),
    }),
  })

  // 6. DELETE /api/roles/:id - Delete custom role (cannot delete system role)
  .delete("/roles/:id", async ({ params, currentUser }) => {
    if (!currentUser.isSuperadmin && !currentUser.permissions.includes("roles:delete")) {
      throw new Error("403 Forbidden: Only administrators can delete roles");
    }

    const [targetRole] = await db.select().from(roles).where(eq(roles.id, params.id));
    if (!targetRole) {
      throw new Error("404 Not Found: Role not found");
    }

    if (targetRole.isSystem) {
      throw new Error("400 Bad Request: Cannot delete protected system role");
    }

    await db.delete(roles).where(eq(roles.id, params.id));
    return { success: true, deletedId: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  });
