import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Activity,
  Plus,
  Trash2,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Building2,
  Globe
} from "lucide-react";
import { api } from "../lib/eden";
import type { Role, UserWithRoles, AuditLog } from "@asterisk/types";
import { CreateRoleModal } from "./CreateRoleModal";
import { AssignRoleModal } from "./AssignRoleModal";

interface RolesAuditManagerProps {
  isShowing?: boolean;
  initialTab?: "roles" | "users" | "audit";
}

interface AuditStats {
  total: number;
  decryptions: number;
  showingToggles: number;
  secretUpdates: number;
}

export function RolesAuditManager({
  isShowing = false,
  initialTab = "roles",
}: RolesAuditManagerProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "users" | "audit">(initialTab);

  // Data states
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats>({
    total: 0,
    decryptions: 0,
    showingToggles: 0,
    secretUpdates: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Modal states
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<{ id: string; name: string } | null>(null);

  const fetchRolesData = async () => {
    try {
      const res = await api.api.roles.get();
      if (res.data && Array.isArray(res.data)) {
        setRoles(res.data as unknown as Role[]);
      }
    } catch (err) {
      console.warn("[Asterisk] Failed to fetch roles:", err);
    }
  };

  const fetchUsersData = async () => {
    try {
      const res = await api.api.users.get();
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data as unknown as UserWithRoles[]);
      }
    } catch (err) {
      console.warn("[Asterisk] Failed to fetch users:", err);
    }
  };

  const fetchAuditData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.api.audit.get({
          headers: {
            "x-asterisk-showing-mode": String(isShowing),
          },
        }),
        api.api.audit.stats.get({
          headers: {
            "x-asterisk-showing-mode": String(isShowing),
          },
        }),
      ]);

      if (logsRes.data && Array.isArray(logsRes.data)) {
        setAuditLogs(logsRes.data as unknown as AuditLog[]);
      }
      if (statsRes.data) {
        setAuditStats(statsRes.data as unknown as AuditStats);
      }
    } catch (err) {
      console.warn("[Asterisk] Failed to fetch audit logs:", err);
    }
  };

  const reloadAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchRolesData(), fetchUsersData(), fetchAuditData()]);
    setIsLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, [isShowing]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete custom role "${roleName}"?`)) {
      return;
    }

    try {
      const res = await api.api.roles({ id: roleId }).delete();
      if (res.error) {
        alert(typeof res.error.value === "string" ? res.error.value : "Failed to delete role.");
        return;
      }
      fetchRolesData();
    } catch (err) {
      alert("Error deleting role: " + String(err));
    }
  };

  const handleRevokeRole = async (userId: string, assignmentId: string) => {
    if (!confirm("Revoke this role assignment from user?")) {
      return;
    }

    try {
      const res = await api.api.users({ id: userId }).roles({ roleAssignmentId: assignmentId }).delete();
      if (res.error) {
        alert("Failed to revoke role assignment.");
        return;
      }
      fetchUsersData();
    } catch (err) {
      alert("Error revoking role: " + String(err));
    }
  };

  const handleOpenAssignModal = (user: UserWithRoles) => {
    setSelectedUserForAssign({ id: user.id, name: user.fullName });
    setIsAssignRoleOpen(true);
  };

  // Filtered lists
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.userFullName && log.userFullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18191E] border border-white/5 p-6 rounded-[24px]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/10 border border-[#FF6C22]/20 flex items-center justify-center text-[#FF6C22]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                RBAC Access & Security Governance
                {isShowing && (
                  <span className="text-[10px] font-mono uppercase bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 px-2 py-0.5 rounded-full">
                    Showing Mode Active
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Dynamic roles, granular permission matrices, dual-tier user scoping, and tamper-proof audit trails.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#06080D] border border-white/5 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "roles"
                ? "bg-[#25272D] text-white shadow-sm border border-white/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#FF6C22]" />
            Roles & Matrix ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "users"
                ? "bg-[#25272D] text-white shadow-sm border border-white/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
            User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "audit"
                ? "bg-[#25272D] text-white shadow-sm border border-white/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            Audit Explorer ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Sub-bar: Search, Filters & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18191E] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "roles"
                  ? "Search roles by name or description..."
                  : activeTab === "users"
                  ? "Search users by name or email..."
                  : "Search audit logs by action, user, or IP..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6C22]/50 transition-colors"
            />
          </div>

          {activeTab === "audit" && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]/50 transition-colors"
              >
                <option value="ALL">All Actions</option>
                <option value="VAULT_DECRYPT">VAULT_DECRYPT</option>
                <option value="VAULT_CREATE">VAULT_CREATE</option>
                <option value="SHOWING_TOGGLE">SHOWING_TOGGLE</option>
                <option value="TASK_CREATED">TASK_CREATED</option>
                <option value="STATUS_CHANGED">STATUS_CHANGED</option>
                <option value="CLIENT_CREATED">CLIENT_CREATED</option>
                <option value="ROLE_ASSIGNED">ROLE_ASSIGNED</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={reloadAll}
            disabled={isLoading}
            className="p-2 bg-[#06080D] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF6C22]" : ""}`} />
          </button>

          {activeTab === "roles" && (
            <button
              onClick={() => setIsCreateRoleOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#FF6C22]/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Custom Role
            </button>
          )}

          {activeTab === "users" && (
            <button
              onClick={() => {
                if (users.length > 0) {
                  handleOpenAssignModal(users[0]);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#3B82F6]/10"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Assign Role to User
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ROLES & PERMISSIONS MATRIX */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="bg-[#18191E] border border-white/5 hover:border-white/10 rounded-[20px] p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#25272D] border border-white/10 flex items-center justify-center text-white">
                      {role.isSystem ? <Lock className="w-4 h-4 text-[#F59E0B]" /> : <Shield className="w-4 h-4 text-[#FF6C22]" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight font-mono">{role.name}</h3>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        role.isSystem
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                          : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                      }`}>
                        {role.isSystem ? "System Default" : "Custom Dynamic"}
                      </span>
                    </div>
                  </div>

                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                  {role.description || "No description provided for this dynamic role."}
                </p>

                {/* Granular Permissions Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>Granular Capabilities</span>
                    <span className="font-mono text-white font-semibold">
                      {role.permissions ? role.permissions.length : 0} granted
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-[#06080D] border border-white/5 rounded-xl">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((pId) => (
                        <span
                          key={pId}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#25272D] text-gray-300 border border-white/5 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#10B981]" />
                          {pId}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-500 italic p-1">No permissions configured</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-mono">ID: {role.id.slice(0, 8)}...</span>
                <span className="font-mono text-gray-400">
                  {role.permissions ? `${role.permissions.length} perms` : "0 perms"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & DUAL-TIER ASSIGNMENTS */}
      {activeTab === "users" && (
        <div className="bg-[#18191E] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Team Directory</h3>
              <p className="text-xs text-gray-400">
                Manage dual-tier assignments: Global Platform wide vs Client Tenant scoped roles.
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400 bg-[#06080D] px-3 py-1.5 rounded-xl border border-white/5">
              {filteredUsers.length} Users Listed
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6C22]/20 to-[#3B82F6]/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{user.fullName}</h4>
                      {user.isSuperadmin && (
                        <span className="text-[10px] font-mono uppercase bg-[#FF6C22]/10 text-[#FF6C22] border border-[#FF6C22]/20 px-2 py-0.2 rounded-full">
                          Superadmin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                  </div>
                </div>

                {/* Assigned Dual-Tier Roles */}
                <div className="flex-1 md:max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {user.assignedRoles && user.assignedRoles.length > 0 ? (
                      user.assignedRoles.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-1.5 bg-[#06080D] border border-white/10 px-2.5 py-1 rounded-xl text-xs"
                        >
                          {assignment.clientId ? (
                            <Building2 className="w-3 h-3 text-[#3B82F6]" />
                          ) : (
                            <Globe className="w-3 h-3 text-[#10B981]" />
                          )}
                          <span className="font-mono font-semibold text-white">{assignment.roleName}</span>

                          {/* Dual-Tier Scope Badge */}
                          {assignment.clientId ? (
                            <span className="text-[10px] font-medium text-gray-400 bg-[#25272D] px-1.5 py-0.5 rounded-md">
                              {isShowing ? "Client Tenant" : assignment.clientName || "Tenant"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-md">
                              Global
                            </span>
                          )}

                          <button
                            onClick={() => handleRevokeRole(user.id, assignment.id)}
                            className="ml-1 text-gray-500 hover:text-red-400 transition-colors p-0.5"
                            title="Revoke role"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No explicit roles assigned</span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAssignModal(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25272D] hover:bg-[#25272D]/80 border border-white/10 text-white text-xs font-medium rounded-xl transition-all"
                  >
                    <Plus className="w-3 h-3 text-[#3B82F6]" />
                    Assign Role
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY AUDIT LOG EXPLORER */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Audit Metrics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#18191E] border border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium">Total Audited Events</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{auditStats.total}</p>
            </div>
            <div className="bg-[#18191E] border border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#F59E0B]" />
                Vault Decryptions
              </span>
              <p className="text-2xl font-bold font-mono text-[#F59E0B] mt-1">{auditStats.decryptions}</p>
            </div>
            <div className="bg-[#18191E] border border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FF6C22]" />
                Showing Mode Switches
              </span>
              <p className="text-2xl font-bold font-mono text-[#FF6C22] mt-1">{auditStats.showingToggles}</p>
            </div>
            <div className="bg-[#18191E] border border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                Secret Created / Updated
              </span>
              <p className="text-2xl font-bold font-mono text-[#10B981] mt-1">{auditStats.secretUpdates}</p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#18191E] border border-white/5 rounded-[24px] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Immutable Event Journal</h3>
                <p className="text-xs text-gray-400">
                  Real-time recording of credential access, tenant changes, and Showing Mode triggers.
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400 bg-[#06080D] px-3 py-1.5 rounded-xl border border-white/5">
                {filteredLogs.length} Events Logged
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isDecryption = log.action === "VAULT_DECRYPT";
                const isShowingEvent = log.action === "SHOWING_TOGGLE";

                return (
                  <div key={log.id} className="p-4 hover:bg-white/[0.01] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1 text-gray-400 hover:text-white rounded-lg"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border font-semibold ${
                            isDecryption
                              ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                              : isShowingEvent
                              ? "bg-[#FF6C22]/10 text-[#FF6C22] border-[#FF6C22]/20"
                              : "bg-[#25272D] text-gray-300 border-white/5"
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            {log.resourceType} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                          <span className="text-white font-medium">{log.userFullName || "System"}</span>
                          <span className="text-gray-500">({log.ipAddress || "127.0.0.1"})</span>
                        </div>

                        <span className="text-gray-500 font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Expandable JSON Metadata */}
                    {isExpanded && (
                      <div className="mt-3 ml-7 p-3 bg-[#06080D] border border-white/5 rounded-xl text-xs font-mono text-gray-400 overflow-x-auto">
                        <div className="text-[10px] uppercase text-gray-500 mb-1 font-bold">Metadata Payload</div>
                        <pre className="text-xs text-emerald-400">
                          {JSON.stringify(log.metadata || {}, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-xs">
                  No audit log entries matching your current filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        onSuccess={() => {
          setIsCreateRoleOpen(false);
          fetchRolesData();
        }}
      />

      {selectedUserForAssign && (
        <AssignRoleModal
          isOpen={isAssignRoleOpen}
          onClose={() => setIsAssignRoleOpen(false)}
          onSuccess={() => {
            setIsAssignRoleOpen(false);
            fetchUsersData();
          }}
          userId={selectedUserForAssign.id}
          userName={selectedUserForAssign.name}
        />
      )}
    </div>
  );
}
