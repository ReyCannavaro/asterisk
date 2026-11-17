import React, { useState, useEffect } from "react";
import { 
  KeyRound, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Database, 
  Terminal, 
  Cloud, 
  Server, 
  Building2, 
  History
} from "lucide-react";
import { api } from "../lib/eden";
import { CreateSecretModal } from "./CreateSecretModal";
import { RevealSecretModal } from "./RevealSecretModal";
import type { CredentialType, AuditLog } from "@asterisk/types";

interface VaultManagerProps {
  isShowing: boolean;
}

interface VaultCredentialItem {
  id: string;
  environmentId: string;
  type: CredentialType;
  name: string;
  encryptedValue: string;
  keyVersion: number;
  lastRotatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  environmentName?: string;
  environmentHost?: string;
  environmentPort?: number;
  isProtected?: boolean;
  clientId?: string;
  clientCode?: string;
  clientName?: string;
  clientShowingAlias?: string;
}

export function VaultManager({ isShowing }: VaultManagerProps) {
  const [credentials, setCredentials] = useState<VaultCredentialItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>("ALL");
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revealTarget, setRevealTarget] = useState<VaultCredentialItem | null>(null);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  const loadVaultData = async () => {
    setIsLoading(true);
    try {
      const [credsRes, auditRes] = await Promise.all([
        api.api.vault.get({
          headers: { "x-asterisk-showing-mode": String(isShowing) },
        }),
        api.api.vault.audit.get({
          headers: { "x-asterisk-showing-mode": String(isShowing) },
        }),
      ]);

      if (credsRes.data && Array.isArray(credsRes.data)) {
        setCredentials(credsRes.data as unknown as VaultCredentialItem[]);
      }
      if (auditRes.data && Array.isArray(auditRes.data)) {
        setAuditLogs(auditRes.data as unknown as AuditLog[]);
      }
    } catch (err) {
      console.warn("[Asterisk Vault] Failed to load vault data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, [isShowing]);

  const handleDeleteSecret = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this credential from the vault? This action is irreversible.")) {
      return;
    }

    try {
      await api.api.vault({ id }).delete();
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      loadVaultData();
    } catch (err) {
      alert("Failed to delete credential: " + err);
    }
  };

  // Filtered credentials
  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch = 
      cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cred.clientName && cred.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cred.clientShowingAlias && cred.clientShowingAlias.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cred.environmentName && cred.environmentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedTypeFilter === "ALL" || cred.type === selectedTypeFilter;
    const matchesClient = selectedClientFilter === "ALL" || cred.clientId === selectedClientFilter || cred.clientCode === selectedClientFilter;

    return matchesSearch && matchesType && matchesClient;
  });

  // Client pill options
  const uniqueClients = Array.from(
    new Map(
      credentials
        .filter((c) => c.clientId)
        .map((c) => [c.clientId!, { id: c.clientId!, code: c.clientCode || "", name: isShowing && c.clientShowingAlias ? c.clientShowingAlias : c.clientName || "" }])
    ).values()
  );

  const getSecretTypeIcon = (type: CredentialType) => {
    switch (type) {
      case "POSTGRES_PASSWORD":
        return <Database className="w-4 h-4 text-emerald-400" />;
      case "API_MASTER_TOKEN":
        return <KeyRound className="w-4 h-4 text-[#FF6C22]" />;
      case "SSH_PRIVATE_KEY":
        return <Terminal className="w-4 h-4 text-sky-400" />;
      case "AWS_ACCESS_KEY":
        return <Cloud className="w-4 h-4 text-amber-400" />;
      default:
        return <Lock className="w-4 h-4 text-purple-400" />;
    }
  };

  const getEnvBadgeStyle = (envName?: string) => {
    switch (envName?.toUpperCase()) {
      case "PRODUCTION":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "STAGING":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "UAT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#18191E] tracking-tight">Secrets & Credential Vault</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF6C22]/10 text-[#FF6C22] border border-[#FF6C22]/20">
              AES-256-GCM
            </span>
          </div>
          <p className="text-xs text-[#25272D]/60 mt-1">
            Zero-leak multi-tenant credential storage with authenticated encryption and instant screen-share masking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-[#18191E] text-xs font-semibold transition-colors"
          >
            <History className="w-4 h-4 text-[#FF6C22]" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#FF6C22]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Store New Secret</span>
          </button>
        </div>
      </div>

      {/* 2. Showing Mode Status Banner */}
      {isShowing ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start justify-between gap-3 text-amber-900 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Showing Mode Anti-Leak Active
                </h2>
                <kbd className="px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-mono text-[10px]">
                  Ctrl+Shift+S
                </kbd>
              </div>
              <p className="text-xs text-amber-800/80 mt-0.5 leading-relaxed">
                Hardware screen shield is enabled. All decrypted values and raw passwords are hard-blocked (••••••••••••) to guarantee zero confidential data leakage during client demonstrations.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold shrink-0">
            PROTECTED
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#18191E] border border-white/10 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF6C22] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Normal Vault Mode · Decryption Permitted
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Revealing secrets writes an immutable record to the audit trail. Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl+Shift+S</kbd> anytime before screen sharing.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 text-[11px] font-semibold shrink-0">
            Internal Access
          </span>
        </div>
      )}

      {/* 3. Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#25272D]/50 font-medium">
            <span>Total Encrypted Secrets</span>
            <Lock className="w-4 h-4 text-[#FF6C22]" />
          </div>
          <div className="text-2xl font-bold text-[#18191E]">{credentials.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>100% AES-256-GCM</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#25272D]/50 font-medium">
            <span>Clients Covered</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-[#18191E]">{uniqueClients.length}</div>
          <div className="text-[11px] text-[#25272D]/50">Multi-tenant isolated</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#25272D]/50 font-medium">
            <span>Production Secrets</span>
            <Server className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-[#18191E]">
            {credentials.filter((c) => c.environmentName?.toUpperCase() === "PRODUCTION").length}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">Strict isolation active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#25272D]/50 font-medium">
            <span>Audit Events</span>
            <History className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[#18191E]">{auditLogs.length}</div>
          <div className="text-[11px] text-amber-600 font-medium">Immutable log trail</div>
        </div>
      </div>

      {/* 4. Search and Filter Bar */}
      <div className="p-3 bg-white rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25272D]/40" />
          <input
            type="text"
            placeholder="Search secrets by label, client, or environment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/[0.03] rounded-xl text-xs text-[#18191E] placeholder:text-[#25272D]/40 focus:outline-none focus:ring-1 focus:ring-[#FF6C22]"
          />
        </div>

        {/* Type & Client Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl">
            {["ALL", "POSTGRES_PASSWORD", "API_MASTER_TOKEN", "SSH_PRIVATE_KEY"].map((typeKey) => (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedTypeFilter(typeKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  selectedTypeFilter === typeKey
                    ? "bg-white text-[#18191E] shadow-xs"
                    : "text-[#25272D]/60 hover:text-[#18191E]"
                }`}
              >
                {typeKey === "ALL" ? "All Types" : typeKey.replace("_", " ")}
              </button>
            ))}
          </div>

          {uniqueClients.length > 0 && (
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-black/[0.03] text-xs font-medium text-[#18191E] rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Clients</option>
              {uniqueClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={loadVaultData}
            title="Refresh Vault Data"
            className="p-2 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] text-[#25272D]/60 hover:text-[#18191E] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF6C22]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5. Secrets Catalog Table / Cards */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {filteredCredentials.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center text-[#25272D]/40 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#18191E]">No credentials found in vault</p>
              <p className="text-xs text-[#25272D]/50 mt-0.5">
                {searchQuery ? "Try refining your search keyword or reset filters" : "Store your first client database password or API token."}
              </p>
            </div>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#FF6C22] text-white text-xs font-bold shadow-md hover:bg-[#FF6C22]/90 transition-colors"
              >
                + Store New Secret
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] text-[#25272D]/50 border-b border-black/5 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Secret Identification</th>
                  <th className="px-4 py-3.5">Tenant & Environment</th>
                  <th className="px-4 py-3.5">Encrypted Cipher (AES-256-GCM)</th>
                  <th className="px-4 py-3.5">Key Version</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-[#18191E]">
                {filteredCredentials.map((cred) => {
                  return (
                    <tr key={cred.id} className="hover:bg-black/[0.015] transition-colors group">
                      {/* Name & Type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-black/[0.04] border border-black/5 flex items-center justify-center shrink-0">
                            {getSecretTypeIcon(cred.type)}
                          </div>
                          <div>
                            <div className="font-bold text-[#18191E] flex items-center gap-1.5">
                              <span>{cred.name}</span>
                            </div>
                            <span className="text-[11px] text-[#25272D]/50 font-mono">
                              {cred.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client & Environment */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-[#18191E] flex items-center gap-1.5">
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-black/5 font-mono text-[#25272D]/70">
                              {cred.clientCode || "CLIENT"}
                            </span>
                            <span>
                              {isShowing && cred.clientShowingAlias ? cred.clientShowingAlias : cred.clientName || "Unknown Client"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEnvBadgeStyle(cred.environmentName)}`}>
                              {cred.environmentName || "DEV"}
                            </span>
                            <span className="text-[11px] text-[#25272D]/40 font-mono">
                              {isShowing ? "••••••••••••:••••" : `${cred.environmentHost}:${cred.environmentPort}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Encrypted Value Preview */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          {isShowing ? (
                            <span className="font-mono tracking-widest text-[#25272D]/40 text-xs select-none">
                              ••••••••••••••••
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-[#25272D]/50 truncate max-w-[200px]" title={cred.encryptedValue}>
                              {cred.encryptedValue.slice(0, 24)}...
                            </span>
                          )}
                          {isShowing && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-bold">
                              MASKED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Key Version & Date */}
                      <td className="px-4 py-4">
                        <div className="text-[11px] font-mono text-[#25272D]/60">
                          v{cred.keyVersion}
                        </div>
                        <div className="text-[10px] text-[#25272D]/40">
                          {cred.lastRotatedAt ? "Rotated" : "Initial key"}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRevealTarget(cred)}
                            className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all ${
                              isShowing 
                                ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/20" 
                                : "bg-[#FF6C22]/10 text-[#FF6C22] hover:bg-[#FF6C22] hover:text-white border border-[#FF6C22]/20"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isShowing ? "Shield" : "Reveal"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSecret(cred.id)}
                            className="p-1.5 rounded-xl text-black/30 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete Credential"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Expandable Live Audit Trail Drawer */}
      {isAuditDrawerOpen && (
        <div className="bg-[#18191E] rounded-2xl border border-white/10 text-white p-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#FF6C22]" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-white">
                Immutable Security Audit Trail (Recent 20 Actions)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAuditDrawerOpen(false)}
              className="text-xs text-white/50 hover:text-white"
            >
              Minimize
            </button>
          </div>

          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="py-4 text-center text-xs text-white/40">No audit events recorded yet.</p>
            ) : (
              auditLogs.map((log) => {
                const getActionColor = (action: string) => {
                  switch (action) {
                    case "VAULT_DECRYPT":
                      return "bg-sky-500/20 text-sky-400 border-sky-500/30";
                    case "VAULT_CREATE":
                      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                    case "VAULT_DELETE":
                      return "bg-rose-500/20 text-rose-400 border-rose-500/30";
                    default:
                      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
                  }
                };

                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <div>
                        <span className="font-semibold text-white/90">
                          {log.metadata?.name || log.metadata?.secretName || log.resourceId || "Credential Target"}
                        </span>
                        <span className="text-[11px] text-white/40 ml-2 font-mono">
                          User: Rey Cannavaro
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {log.wasShowingModeActive && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          SHIELD ACTIVE
                        </span>
                      )}
                      <span className="text-[11px] text-white/40 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 7. Interactive Modals */}
      <CreateSecretModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          loadVaultData();
        }}
        isShowing={isShowing}
      />

      <RevealSecretModal
        isOpen={!!revealTarget}
        onClose={() => setRevealTarget(null)}
        secretId={revealTarget?.id || null}
        secretName={revealTarget?.name || ""}
        secretType={revealTarget?.type || ""}
        environmentName={revealTarget?.environmentName || "DEVELOPMENT"}
        clientName={isShowing && revealTarget?.clientShowingAlias ? revealTarget.clientShowingAlias : revealTarget?.clientName || "Client Target"}
        isShowing={isShowing}
        onAuditCreated={loadVaultData}
      />
    </div>
  );
}
