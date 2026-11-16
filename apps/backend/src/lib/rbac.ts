import type { 
  UserSessionProfile, 
  StandardPermission, 
  PermissionResource,
  SidebarConfig,
  NavMenuItem
} from "@asterisk/types";

/**
 * Standard Navigation Catalog mapped to required permissions
 */
export const SYSTEM_NAV_CATALOG: NavMenuItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/#overview",
    icon: "Home",
  },
  {
    id: "clients",
    label: "Clients & Envs",
    href: "/#clients",
    icon: "Folder",
    requiredPermission: "clients:view",
  },
  {
    id: "vault",
    label: "Secrets Vault",
    href: "/#vault",
    icon: "Shield",
    requiredPermission: "vault:view",
  },
  {
    id: "showing",
    label: "Showing Sessions",
    href: "/#showing",
    icon: "Presentation",
    requiredPermission: "showing:view",
  },
  {
    id: "tasks",
    label: "Tasks & QA",
    href: "/#tasks",
    icon: "CheckSquare",
    requiredPermission: "tasks:view",
  },
  {
    id: "roles",
    label: "Role Management",
    href: "/#roles",
    icon: "Users",
    requiredPermission: "roles:view",
  },
  {
    id: "audit",
    label: "Audit Logs",
    href: "/#audit",
    icon: "Activity",
    requiredPermission: "audit:view",
  },
];

/**
 * Validates whether a user can execute a specific permission on an optional target client.
 */
export function hasPermission(
  user: UserSessionProfile,
  permission: StandardPermission,
  targetClientId?: string
): boolean {
  // 1. Superadmin has unconditional god-mode access
  if (user.isSuperadmin) {
    return true;
  }

  // 2. Client-scoped verification: if a target client is specified, verify membership
  if (targetClientId) {
    const hasClientAccess = user.accessibleClientIds.includes(targetClientId);
    if (!hasClientAccess) {
      return false;
    }
  }

  // 3. Check explicit permission in user's aggregated permission set
  return user.permissions.includes(permission);
}

/**
 * Validates whether a user can view a specific resource/page.
 */
export function canViewResource(
  user: UserSessionProfile,
  resource: PermissionResource
): boolean {
  if (user.isSuperadmin) return true;
  return user.permissions.includes(`${resource}:view` as StandardPermission);
}

/**
 * Filters navigation items dynamically based on the current user's permissions.
 */
export function filterNavigationForUser(user: UserSessionProfile): NavMenuItem[] {
  if (user.isSuperadmin) {
    return SYSTEM_NAV_CATALOG;
  }

  return SYSTEM_NAV_CATALOG.filter((item) => {
    if (!item.requiredPermission) return true;
    return user.permissions.includes(item.requiredPermission);
  });
}
