// =======================================================
// ASTERISK CORE TYPE SYSTEM
// =======================================================

// 1. Granular Dynamic RBAC System
export type PermissionAction = 
  | "view" 
  | "create" 
  | "read" 
  | "update" 
  | "delete" 
  | "reveal" 
  | "qa_verify" 
  | "export"
  | "add_feedback";

export type PermissionResource = 
  | "clients" 
  | "envs" 
  | "vault" 
  | "showing" 
  | "tasks" 
  | "audit" 
  | "roles" 
  | "users";

export type StandardPermission = 
  | "clients:view" | "clients:create" | "clients:read" | "clients:update" | "clients:delete"
  | "envs:view" | "envs:create" | "envs:read" | "envs:update" | "envs:delete"
  | "vault:view" | "vault:create" | "vault:read" | "vault:update" | "vault:delete" | "vault:reveal"
  | "showing:view" | "showing:create" | "showing:read" | "showing:update" | "showing:delete" | "showing:add_feedback"
  | "tasks:view" | "tasks:create" | "tasks:read" | "tasks:update" | "tasks:delete" | "tasks:qa_verify"
  | "audit:view" | "audit:read" | "audit:export"
  | "roles:view" | "roles:create" | "roles:read" | "roles:update" | "roles:delete"
  | "users:view" | "users:create" | "users:read" | "users:update" | "users:delete";

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions?: string[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isSuperadmin: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  clientId: string | null; // null if platform-wide
}

export interface UserSessionProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isSuperadmin: boolean;
  roles: UserRoleAssignment[];
  permissions: string[];
  accessibleClientIds: string[]; // empty array with isSuperadmin=true means access all
}

// 2. Dynamic Navigation Contracts
export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number | string;
  requiredPermission?: StandardPermission;
}

export interface SidebarConfig {
  menuItems: NavMenuItem[];
  activeClients: Array<{
    id: string;
    code: string;
    name: string;
    showingAlias?: string;
    activeTasksCount: number;
    healthStatus: "HEALTHY" | "ATTENTION" | "CRITICAL";
  }>;
  currentUser: {
    fullName: string;
    initials: string;
    roleLabel: string;
    isSuperadmin: boolean;
    isOnline: boolean;
  };
}

// 3. Client & Environment Management
export interface Client {
  id: string;
  code: string; // e.g. 'ADARO', 'MANDIRI', 'TELKOMSEL', 'INDOFOOD'
  name: string;
  industry: string;
  showingAlias?: string; // Masked alias during live showing demo (e.g. 'Client-A')
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export type EnvironmentType = "DEVELOPMENT" | "STAGING" | "PRODUCTION" | "UAT";

export interface Environment {
  id: string;
  clientId: string;
  name: EnvironmentType;
  host: string;
  port: number;
  isProtected: boolean;
  createdAt: Date;
}

// 4. Credential Vault
export type CredentialType = 
  | "POSTGRES_PASSWORD" 
  | "SSH_PRIVATE_KEY" 
  | "API_MASTER_TOKEN" 
  | "GENERATOR_SECRET"
  | "ENV_SECRET"
  | "AWS_ACCESS_KEY";

export interface Credential {
  id: string;
  environmentId: string;
  type: CredentialType;
  name: string;
  encryptedValue: string; // iv:ciphertext:tag
  keyVersion: number;
  lastRotatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialWithContext extends Credential {
  environmentName?: string;
  clientId?: string;
  clientName?: string;
  clientCode?: string;
  clientShowingAlias?: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  wasShowingModeActive: boolean;
  metadata?: any;
  createdAt: Date;
}

// 5. Showing Sessions & Feedback Pipeline
export type ShowingStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface ShowingSession {
  id: string;
  clientId: string;
  conductedBy: string;
  title: string;
  scheduledAt: Date;
  status: ShowingStatus;
  notes?: string;
  createdAt: Date;
}

export type FeedbackCategory = "BUG_CRITICAL" | "SHOWING_ENHANCEMENT" | "CLIENT_CUSTOM_REQ";
export type FeedbackSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FeedbackStatus = "LOGGED" | "CONVERTED_TO_TASK" | "RESOLVED";

export interface ShowingFeedback {
  id: string;
  sessionId: string;
  category: FeedbackCategory;
  description: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  createdAt: Date;
}

// 6. Kanban Tasks (HRIS Delivery Pipeline)
export type TaskModuleTag = "PAYROLL" | "ATTENDANCE" | "CLAIM" | "SECURITY" | "MASTER" | "DESIGN" | "DEV" | "BACKEND";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW_QA" | "COMPLETE";

export interface KanbanTask {
  id: string;
  feedbackId?: string;
  clientId: string;
  title: string;
  description?: string;
  moduleTag: TaskModuleTag;
  status: TaskStatus;
  assignedTo?: string;
  dueDate?: Date;
  positionOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 7. Showing Mode State Contract
export interface ShowingState {
  isActive: boolean;
  maskedCount: number;
  lastToggledAt?: Date;
}

export interface MaskedView<T> {
  data: T;
  isMasked: boolean;
}
