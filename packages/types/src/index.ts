// =======================================================
// ASTERISK CORE TYPE SYSTEM
// =======================================================

// 1. Dual-Tier Dynamic RBAC
export type PlatformRole = "SUPERADMIN" | "LEAD_PM" | "DEV_INTERNAL" | "QA_INTERNAL";
export type ClientRole = "CLIENT_VIEWER" | "CLIENT_LEAD";
export type UserRoleType = PlatformRole | ClientRole;

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Client & Environment Management
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

// 3. Credential Vault
export type CredentialType = "POSTGRES_PASSWORD" | "SSH_PRIVATE_KEY" | "API_MASTER_TOKEN" | "GENERATOR_SECRET";

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

// 4. Showing Sessions & Feedback Pipeline
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

// 5. Kanban Tasks (HRIS Delivery Pipeline)
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

// 6. Showing Mode State Contract
export interface ShowingState {
  isActive: boolean;
  maskedCount: number;
  lastToggledAt?: Date;
}

export interface MaskedView<T> {
  data: T;
  isMasked: boolean;
}
