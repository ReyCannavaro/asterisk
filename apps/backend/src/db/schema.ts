import { pgTable, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

// 1. USERS
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("users_email_idx").on(table.email),
]);

// 2. ROLES
export const roles = pgTable("roles", {
  id: text("id").primaryKey(), // 'SUPERADMIN', 'LEAD_PM', 'DEV_INTERNAL', 'QA_INTERNAL', 'CLIENT_VIEWER'
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),
});

// 3. PERMISSIONS
export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(), // 'vault:read', 'vault:decrypt', 'showing:create', 'task:edit'
  category: text("category").notNull(),
  description: text("description"),
});

// 4. ROLE_PERMISSIONS
export const rolePermissions = pgTable("role_permissions", {
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("role_perm_idx").on(table.roleId, table.permissionId),
]);

// 5. USER_ROLES (Dual-Tier RBAC)
export const userRoles = pgTable("user_roles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  clientId: text("client_id"), // null if Platform Role
}, (table) => [
  index("user_roles_user_idx").on(table.userId),
]);

// 6. AUDIT_LOGS (Immutable Security Trail)
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // 'VAULT_DECRYPT', 'SHOWING_TOGGLE', 'CREDENTIAL_UPDATE'
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  wasShowingModeActive: boolean("was_showing_mode_active").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_user_idx").on(table.userId),
  index("audit_logs_action_idx").on(table.action),
  index("audit_logs_created_idx").on(table.createdAt),
]);

// 7. CLIENTS (Tenant HRIS)
export const clients = pgTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(), // 'ADARO', 'MANDIRI', 'TELKOMSEL', 'INDOFOOD'
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  showingAlias: text("showing_alias"), // Masked name during live demo (e.g. 'Client-A')
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. ENVIRONMENTS
export const environments = pgTable("environments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // 'DEVELOPMENT', 'STAGING', 'PRODUCTION', 'UAT'
  host: text("host").notNull(),
  port: integer("port").notNull(),
  isProtected: boolean("is_protected").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. CREDENTIALS (AES-256-GCM Vault)
export const credentials = pgTable("credentials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  environmentId: text("environment_id").notNull().references(() => environments.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'POSTGRES_PASSWORD', 'SSH_PRIVATE_KEY', 'API_MASTER_TOKEN'
  name: text("name").notNull(),
  encryptedValue: text("encrypted_value").notNull(), // iv:ciphertext:tag
  keyVersion: integer("key_version").default(1).notNull(),
  lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("cred_env_idx").on(table.environmentId),
]);

// 10. SHOWING_SESSIONS
export const showingSessions = pgTable("showing_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  conductedBy: text("conducted_by").notNull().references(() => users.id),
  title: text("title").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  status: text("status").notNull(), // 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. SHOWING_FEEDBACKS
export const showingFeedbacks = pgTable("showing_feedbacks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull().references(() => showingSessions.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'BUG_CRITICAL', 'SHOWING_ENHANCEMENT', 'CLIENT_CUSTOM_REQ'
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  status: text("status").default("LOGGED").notNull(), // 'LOGGED', 'CONVERTED_TO_TASK', 'RESOLVED'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 12. TASKS (Kanban Board)
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  feedbackId: text("feedback_id").references(() => showingFeedbacks.id, { onDelete: "set null" }),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  moduleTag: text("module_tag").notNull(), // 'PAYROLL', 'ATTENDANCE', 'CLAIM', 'SECURITY', 'MASTER'
  status: text("status").default("TODO").notNull(), // 'TODO', 'IN_PROGRESS', 'REVIEW_QA', 'COMPLETE'
  assignedTo: text("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date", { withTimezone: true }),
  positionOrder: integer("position_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("tasks_status_idx").on(table.status),
  index("tasks_client_idx").on(table.clientId),
]);

// 13. TASK_ACTIVITIES (Audit & History per Task)
export const taskActivities = pgTable("task_activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // 'STATUS_CHANGED', 'COMMENT_ADDED', 'ASSIGNED'
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
