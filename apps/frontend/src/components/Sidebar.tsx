import React from "react";
import { 
  Home, 
  Activity, 
  CheckSquare, 
  Folder, 
  Shield, 
  Tv, 
  Users, 
  Settings, 
  Plus, 
  Lock
} from "lucide-react";
import type { SidebarConfig } from "@asterisk/types";

interface SidebarProps {
  config?: SidebarConfig;
  isShowing?: boolean;
  activeView?: string;
  onSelectView?: (viewId: string) => void;
  onSelectClient?: (clientId: string) => void;
  onOpenCreateClient?: () => void;
}

const DEFAULT_CONFIG: SidebarConfig = {
  menuItems: [
    { id: "overview", label: "Overview", href: "#overview", icon: "Home", badge: 12 },
    { id: "clients", label: "Clients & Envs", href: "#clients", icon: "Folder", requiredPermission: "clients:view" },
    { id: "vault", label: "Secrets Vault", href: "#vault", icon: "Shield", requiredPermission: "vault:view" },
    { id: "showing", label: "Showing Sessions", href: "#showing", icon: "Tv", badge: "LIVE", requiredPermission: "showing:view" },
    { id: "tasks", label: "Tasks & QA", href: "#tasks", icon: "CheckSquare", badge: 3, requiredPermission: "tasks:view" },
    { id: "roles", label: "Dynamic Roles", href: "#roles", icon: "Users", requiredPermission: "roles:view" },
    { id: "audit", label: "Audit Logs", href: "#audit", icon: "Activity", requiredPermission: "audit:view" },
  ],
  activeClients: [
    { id: "client-adaro", code: "ADARO", name: "PT Adaro Energy Indonesia Tbk", showingAlias: "Client-A (Energy)", activeTasksCount: 4, healthStatus: "HEALTHY" },
    { id: "client-mandiri", code: "MANDIRI", name: "PT Bank Mandiri (Persero) Tbk", showingAlias: "Client-B (Banking)", activeTasksCount: 7, healthStatus: "HEALTHY" },
    { id: "client-telkomsel", code: "TELKOMSEL", name: "PT Telekomunikasi Selular", showingAlias: "Client-C (Telco)", activeTasksCount: 2, healthStatus: "ATTENTION" },
    { id: "client-indofood", code: "INDOFOOD", name: "PT Indofood Sukses Makmur Tbk", showingAlias: "Client-D (FMCG)", activeTasksCount: 1, healthStatus: "HEALTHY" },
  ],
  currentUser: {
    fullName: "Rey Cannavaro",
    initials: "RC",
    roleLabel: "Superadministrator",
    isSuperadmin: true,
    isOnline: true,
  },
};

export function Sidebar({ 
  config = DEFAULT_CONFIG, 
  isShowing = false,
  activeView = "overview",
  onSelectView,
  onSelectClient,
  onOpenCreateClient
}: SidebarProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Home": return <Home className="w-4 h-4" />;
      case "Folder": return <Folder className="w-4 h-4" />;
      case "Shield": return <Shield className="w-4 h-4" />;
      case "Tv":
      case "Presentation": return <Tv className="w-4 h-4" />;
      case "CheckSquare": return <CheckSquare className="w-4 h-4" />;
      case "Users": return <Users className="w-4 h-4" />;
      case "Activity": return <Activity className="w-4 h-4" />;
      case "Settings": return <Settings className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <aside className="w-[260px] bg-[#18191E] text-white rounded-[24px] p-5 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex items-center justify-center">
              {/* Swiss Monolith Asterisk Icon */}
              <div className="w-6 h-6 relative flex items-center justify-center">
                <span className="text-[#FF6C22] text-2xl font-black leading-none select-none">*</span>
                <div className="w-1.5 h-1.5 bg-white rounded-full absolute" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight">Asterisk</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider">DEV PORTAL</span>
            </div>
          </div>

          {/* Showing Mode Pill in Sidebar Header */}
          {isShowing && (
            <span className="flex items-center gap-1 bg-[#FF6C22]/20 border border-[#FF6C22]/40 text-[#FF6C22] text-[9px] font-bold px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              MASKED
            </span>
          )}
        </div>

        {/* Dynamic Navigation Menu */}
        <div className="mb-6">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-3">
            Navigation
          </span>
          <nav className="space-y-1">
            {config.menuItems.map((item) => {
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView?.(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isSelected
                      ? "bg-[#25272F] text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? "text-[#FF6C22]" : "text-gray-400"}>
                      {getIcon(item.icon)}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badge === "LIVE"
                          ? "bg-red-500 text-white animate-pulse"
                          : isSelected
                          ? "bg-[#FF6C22] text-white"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Client Tenants Section (Project-Scoped Access) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Clients ({config.activeClients.length})
            </span>
            {config.currentUser.isSuperadmin && (
              <button 
                type="button"
                onClick={onOpenCreateClient}
                title="Register New Client"
                className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-md"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
            {config.activeClients.map((client) => {
              const displayName = isShowing && client.showingAlias ? client.showingAlias : client.name;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => onSelectClient?.(client.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 text-xs font-medium transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-[#25272F] group-hover:bg-[#FF6C22]/20 text-[#FF6C22] flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                      {client.code.slice(0, 2)}
                    </div>
                    <span className="truncate">{displayName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-300 shrink-0 ml-1">
                    {client.activeTasksCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Pinned Bottom User Profile Card */}
      <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF6C22] to-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
              {config.currentUser.initials}
            </div>
            {config.currentUser.isOnline && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#18191E] absolute bottom-0 right-0" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs truncate block text-gray-100">
              {config.currentUser.fullName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-mono block truncate">
                {config.currentUser.roleLabel}
              </span>
              {config.currentUser.isSuperadmin && (
                <span className="bg-[#FF6C22]/20 text-[#FF6C22] text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                  ROOT
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          title="Account Preferences"
          className="text-gray-400 hover:text-white transition p-1.5 hover:bg-white/5 rounded-lg"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
