import { db } from "./index";
import { 
  users, 
  roles, 
  permissions, 
  rolePermissions, 
  userRoles,
  clients, 
  environments, 
  credentials, 
  tasks 
} from "./schema";
import { encrypt } from "../lib/vault";
import type { StandardPermission, PermissionResource, PermissionAction } from "@asterisk/types";

export async function seedDatabase() {
  console.log("🌱 Starting Asterisk Database Seeding...");

  // 1. GRANULAR PERMISSIONS MATRIX DEFINITION
  const rawPermissions: Array<{ id: StandardPermission; resource: PermissionResource; action: PermissionAction; category: string; description: string }> = [
    // Clients
    { id: "clients:view", resource: "clients", action: "view", category: "MANAGEMENT", description: "View Clients page in navigation" },
    { id: "clients:create", resource: "clients", action: "create", category: "MANAGEMENT", description: "Register new client tenant" },
    { id: "clients:read", resource: "clients", action: "read", category: "MANAGEMENT", description: "Inspect client details and metadata" },
    { id: "clients:update", resource: "clients", action: "update", category: "MANAGEMENT", description: "Edit client information and showing alias" },
    { id: "clients:delete", resource: "clients", action: "delete", category: "MANAGEMENT", description: "Archive or delete client" },

    // Environments
    { id: "envs:view", resource: "envs", action: "view", category: "MANAGEMENT", description: "View client environments" },
    { id: "envs:create", resource: "envs", action: "create", category: "MANAGEMENT", description: "Add new environment (Dev, Staging, Prod)" },
    { id: "envs:read", resource: "envs", action: "read", category: "MANAGEMENT", description: "Read environment host and ports" },
    { id: "envs:update", resource: "envs", action: "update", category: "MANAGEMENT", description: "Update host, port, or status" },
    { id: "envs:delete", resource: "envs", action: "delete", category: "MANAGEMENT", description: "Remove an environment" },

    // Secrets Vault
    { id: "vault:view", resource: "vault", action: "view", category: "SECURITY", description: "Access Secrets Vault page in navigation" },
    { id: "vault:create", resource: "vault", action: "create", category: "SECURITY", description: "Store new encrypted secret in vault" },
    { id: "vault:read", resource: "vault", action: "read", category: "SECURITY", description: "View masked secret list" },
    { id: "vault:update", resource: "vault", action: "update", category: "SECURITY", description: "Rotate or update secret value" },
    { id: "vault:delete", resource: "vault", action: "delete", category: "SECURITY", description: "Delete secret entry" },
    { id: "vault:reveal", resource: "vault", action: "reveal", category: "SECURITY", description: "Decrypt and reveal plaintext secret" },

    // Showing Tracker
    { id: "showing:view", resource: "showing", action: "view", category: "DELIVERY", description: "View Showing Sessions page" },
    { id: "showing:create", resource: "showing", action: "create", category: "DELIVERY", description: "Schedule new showing session" },
    { id: "showing:read", resource: "showing", action: "read", category: "DELIVERY", description: "Read showing session details" },
    { id: "showing:update", resource: "showing", action: "update", category: "DELIVERY", description: "Update showing agenda and notes" },
    { id: "showing:delete", resource: "showing", action: "delete", category: "DELIVERY", description: "Cancel or remove showing session" },
    { id: "showing:add_feedback", resource: "showing", action: "add_feedback", category: "DELIVERY", description: "Log live feedback in Asterisk Sheet" },

    // Tasks & Kanban
    { id: "tasks:view", resource: "tasks", action: "view", category: "DELIVERY", description: "View Tasks & Kanban Board" },
    { id: "tasks:create", resource: "tasks", action: "create", category: "DELIVERY", description: "Create new task or convert feedback to ticket" },
    { id: "tasks:read", resource: "tasks", action: "read", category: "DELIVERY", description: "Inspect task description and history" },
    { id: "tasks:update", resource: "tasks", action: "update", category: "DELIVERY", description: "Update task progress and status" },
    { id: "tasks:delete", resource: "tasks", action: "delete", category: "DELIVERY", description: "Delete task" },
    { id: "tasks:qa_verify", resource: "tasks", action: "qa_verify", category: "DELIVERY", description: "Approve, verify, and close tickets (QA only)" },

    // Audit Logs
    { id: "audit:view", resource: "audit", action: "view", category: "ADMIN", description: "View audit trail page" },
    { id: "audit:read", resource: "audit", action: "read", category: "ADMIN", description: "Read detailed audit logs" },
    { id: "audit:export", resource: "audit", action: "export", category: "ADMIN", description: "Export audit logs report" },

    // Dynamic Roles
    { id: "roles:view", resource: "roles", action: "view", category: "ADMIN", description: "View roles list" },
    { id: "roles:create", resource: "roles", action: "create", category: "ADMIN", description: "Create dynamic custom role" },
    { id: "roles:read", resource: "roles", action: "read", category: "ADMIN", description: "View role permissions matrix" },
    { id: "roles:update", resource: "roles", action: "update", category: "ADMIN", description: "Update role permissions" },
    { id: "roles:delete", resource: "roles", action: "delete", category: "ADMIN", description: "Delete custom role" },

    // Users
    { id: "users:view", resource: "users", action: "view", category: "ADMIN", description: "View user directory" },
    { id: "users:create", resource: "users", action: "create", category: "ADMIN", description: "Invite new team member" },
    { id: "users:read", resource: "users", action: "read", category: "ADMIN", description: "View user profile & role assignments" },
    { id: "users:update", resource: "users", action: "update", category: "ADMIN", description: "Edit user roles or status" },
    { id: "users:delete", resource: "users", action: "delete", category: "ADMIN", description: "Deactivate user" },
  ];

  console.log(`-> Inserting ${rawPermissions.length} granular permissions...`);
  for (const p of rawPermissions) {
    await db.insert(permissions).values(p).onConflictDoNothing();
  }

  // 2. DEFAULT SYSTEM ROLES
  const defaultRoles = [
    { id: "SUPERADMIN", name: "Superadministrator", description: "Unconditional god-mode access across all clients and settings", isSystem: true },
    { id: "LEAD_PM", name: "Lead Project Manager", description: "Delivery lead managing clients, sessions, and vault access", isSystem: true },
    { id: "DEV_INTERNAL", name: "Developer Internal", description: "Implementation engineer with dev environment & task access", isSystem: true },
    { id: "QA_INTERNAL", name: "QA Specialist", description: "Testing specialist logging feedback and verifying tickets", isSystem: true },
    { id: "CLIENT_VIEWER", name: "Client Observer", description: "Read-only client stakeholder viewing roadmap and showing sessions", isSystem: true },
  ];

  console.log(`-> Inserting ${defaultRoles.length} system roles...`);
  for (const r of defaultRoles) {
    await db.insert(roles).values(r).onConflictDoNothing();
  }

  // 3. ROLE-PERMISSION MAPPING
  // Developer permissions: read clients, read envs, view/update tasks, view vault (dev secrets)
  const devPermissions: StandardPermission[] = [
    "clients:view", "clients:read",
    "envs:view", "envs:read",
    "vault:view", "vault:read",
    "tasks:view", "tasks:read", "tasks:update"
  ];

  // QA permissions: read clients, view showing, add feedback, view tasks, verify tasks
  const qaPermissions: StandardPermission[] = [
    "clients:view", "clients:read",
    "envs:view", "envs:read",
    "showing:view", "showing:read", "showing:add_feedback",
    "tasks:view", "tasks:read", "tasks:create", "tasks:update", "tasks:qa_verify"
  ];

  for (const permId of devPermissions) {
    await db.insert(rolePermissions).values({ roleId: "DEV_INTERNAL", permissionId: permId }).onConflictDoNothing();
  }

  for (const permId of qaPermissions) {
    await db.insert(rolePermissions).values({ roleId: "QA_INTERNAL", permissionId: permId }).onConflictDoNothing();
  }

  // 4. SUPERADMIN USER (Rey Cannavaro)
  console.log("-> Seeding Superadmin User (Rey Cannavaro)...");
  const superadminId = "user-rey-superadmin";
  await db.insert(users).values({
    id: superadminId,
    email: "rey@asterisk.internal",
    passwordHash: "$argon2id$mocked_hash_for_dev_master_key",
    fullName: "Rey Cannavaro",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    isSuperadmin: true,
    isActive: true,
  }).onConflictDoNothing();

  await db.insert(userRoles).values({
    userId: superadminId,
    roleId: "SUPERADMIN",
    clientId: null, // Platform-wide
  }).onConflictDoNothing();

  // 5. SAMPLE ENTERPRISE CLIENTS (HRIS Projects)
  console.log("-> Seeding Sample Enterprise Clients...");
  const sampleClients = [
    { id: "client-adaro", code: "ADARO", name: "PT Adaro Energy Indonesia Tbk", industry: "Energy & Mining", showingAlias: "Client-A (Energy)" },
    { id: "client-mandiri", code: "MANDIRI", name: "PT Bank Mandiri (Persero) Tbk", industry: "Banking & Finance", showingAlias: "Client-B (Banking)" },
    { id: "client-telkomsel", code: "TELKOMSEL", name: "PT Telekomunikasi Selular", industry: "Telecommunications", showingAlias: "Client-C (Telco)" },
    { id: "client-indofood", code: "INDOFOOD", name: "PT Indofood Sukses Makmur Tbk", industry: "Consumer Goods & FMCG", showingAlias: "Client-D (FMCG)" },
  ];

  for (const c of sampleClients) {
    await db.insert(clients).values(c).onConflictDoNothing();
  }

  // 6. ENVIRONMENTS & ENCRYPTED VAULT SECRETS
  console.log("-> Seeding Environments & AES-256 Encrypted Secrets...");
  const envAdaroDev = {
    id: "env-adaro-dev",
    clientId: "client-adaro",
    name: "DEVELOPMENT",
    host: "10.20.1.15",
    port: 3010,
    isProtected: false,
  };
  await db.insert(environments).values(envAdaroDev).onConflictDoNothing();

  // Encrypt sample database password with AES-256-GCM
  const secretAdaro = encrypt("postgres://adaro_dev:SuperSecretPass2026@10.20.1.15:5432/hris_adaro");
  await db.insert(credentials).values({
    id: "cred-adaro-db",
    environmentId: envAdaroDev.id,
    type: "POSTGRES_PASSWORD",
    name: "Adaro HRIS PostgreSQL Dev Password",
    encryptedValue: secretAdaro,
    keyVersion: 1,
  }).onConflictDoNothing();

  // 7. SAMPLE KANBAN TASKS
  console.log("-> Seeding Sample Delivery Tasks...");
  const sampleTasks = [
    {
      id: "task-01",
      clientId: "client-mandiri",
      title: "Integrasi SSO Active Directory Mandiri",
      description: "Implementasi SAML 2.0 untuk login karyawan Mandiri",
      moduleTag: "SECURITY",
      status: "IN_PROGRESS",
      positionOrder: 1,
    },
    {
      id: "task-02",
      clientId: "client-adaro",
      title: "Penyesuaian Formula Overtime Tambang Shift Malam",
      description: "Aturan lembur khusus shift 3 area tambang Tanjung",
      moduleTag: "PAYROLL",
      status: "TODO",
      positionOrder: 2,
    },
    {
      id: "task-03",
      clientId: "client-telkomsel",
      title: "Export Rekap Absensi Biometrik Telkomsel",
      description: "Sinkronisasi mesin fingerprint regional Medan & Surabaya",
      moduleTag: "ATTENDANCE",
      status: "REVIEW_QA",
      positionOrder: 3,
    },
  ];

  for (const t of sampleTasks) {
    await db.insert(tasks).values(t).onConflictDoNothing();
  }

  console.log("✅ Asterisk Seeding Completed Successfully!");
}

// Auto-run if executed directly
if (import.meta.main) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
