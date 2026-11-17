import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Server, 
  Plus, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Layers,
  Lock,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { api } from "../lib/eden";
import { CreateClientModal } from "./CreateClientModal";
import { CreateEnvironmentModal } from "./CreateEnvironmentModal";

interface EnvironmentItem {
  id: string;
  clientId: string;
  name: string;
  host: string;
  port: number;
  isProtected: boolean;
  createdAt?: string;
}

interface ClientItem {
  id: string;
  code: string;
  name: string;
  industry: string;
  showingAlias?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  environments?: EnvironmentItem[];
  environmentsCount?: number;
  createdAt?: string;
}

interface ClientsManagerProps {
  isShowing: boolean;
  initialSelectedClientId?: string | null;
  onSelectClient?: (clientId: string | null) => void;
}

export function ClientsManager({ isShowing, initialSelectedClientId = null, onSelectClient }: ClientsManagerProps) {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);

  // Modals
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isCreateEnvOpen, setIsCreateEnvOpen] = useState(false);

  // Load clients from API
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await api.api.clients.get({
        headers: {
          "x-asterisk-showing-mode": String(isShowing),
        },
      });
      if (res.data && Array.isArray(res.data)) {
        setClients(res.data as unknown as ClientItem[]);
        if (selectedClient) {
          const updatedSelected = (res.data as unknown as ClientItem[]).find((c) => c.id === selectedClient.id);
          if (updatedSelected) {
            setSelectedClient(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error("[Asterisk] Failed to fetch clients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isShowing]);

  useEffect(() => {
    if (initialSelectedClientId && clients.length > 0) {
      const match = clients.find((c) => c.id === initialSelectedClientId);
      if (match) setSelectedClient(match);
    }
  }, [initialSelectedClientId, clients]);

  // Handle client selection
  const handleSelectClient = (client: ClientItem | null) => {
    setSelectedClient(client);
    if (onSelectClient) {
      onSelectClient(client ? client.id : null);
    }
  };

  // Delete environment handler
  const handleDeleteEnvironment = async (envId: string) => {
    if (!confirm("Are you sure you want to remove this environment?")) return;
    try {
      const res = await api.api.clients.environments({ envId }).delete();
      if (!res.error) {
        fetchClients();
      }
    } catch (err) {
      console.error("Failed to delete environment:", err);
    }
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const displayName = isShowing && c.showingAlias ? c.showingAlias : c.name;
    const matchesSearch = 
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === "ALL" || c.industry.includes(selectedIndustry);
    return matchesSearch && matchesIndustry;
  });

  const allIndustries = ["ALL", "Banking", "Energy", "Telecommunications", "FMCG", "Technology"];

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case "PRODUCTION":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "STAGING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "UAT":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-sky-50 text-sky-700 border-sky-200";
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-150">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & ACTIONS */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            {selectedClient && (
              <button
                onClick={() => handleSelectClient(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                title="Back to all clients"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
              {selectedClient ? (isShowing && selectedClient.showingAlias ? selectedClient.showingAlias : selectedClient.name) : "Client Hub & Environments"}
            </h2>
            {isShowing && (
              <span className="flex items-center gap-1 bg-[#FF6C22]/10 border border-[#FF6C22]/30 text-[#FF6C22] text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                MASKED
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedClient
              ? `Manage server environments and configuration for tenant [${selectedClient.code}]`
              : "Enterprise multi-client tenant directories, isolation boundaries, and server profiles"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchClients}
            disabled={isLoading}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF6C22]" : ""}`} />
          </button>

          {selectedClient ? (
            <button
              onClick={() => setIsCreateEnvOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6C22] text-white hover:bg-[#FF7A29] transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Environment</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateClientOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6C22] text-white hover:bg-[#FF7A29] transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Client</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT (GRID OR DETAIL VIEW) */}
      {/* ======================================================== */}
      {!selectedClient ? (
        /* ======================== ALL CLIENTS CATALOG ======================== */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients by name, code, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6C22]"
              />
            </div>

            {/* Industry Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {allIndustries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    selectedIndustry === ind
                      ? "bg-[#18191E] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {ind === "ALL" ? "All Sectors" : ind}
                </button>
              ))}
            </div>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const displayName = isShowing && client.showingAlias ? client.showingAlias : client.name;
              const envCount = client.environments?.length ?? client.environmentsCount ?? 0;

              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group space-y-4"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#18191E] text-[#FF6C22] flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-xs">
                          {client.code.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#111827] leading-tight truncate">
                            {displayName}
                          </h4>
                          <span className="text-[11px] font-mono text-gray-400">
                            [{client.code}]
                          </span>
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0">
                        {client.industry.split(" ")[0]}
                      </span>
                    </div>

                    {/* Showing Mode Alias Tag */}
                    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Showing Alias:
                        </span>
                        <span className="font-mono text-gray-500">
                          {isShowing ? "Masked" : "Active"}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-800 font-mono truncate">
                        {client.showingAlias || "Client-" + client.code}
                      </div>
                    </div>
                  </div>

                  {/* Environments Preview List */}
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Server className="w-3.5 h-3.5" />
                        Environments ({envCount})
                      </span>
                      {envCount === 0 && (
                        <span className="text-[10px] text-amber-600 font-medium">No envs yet</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                      {client.environments && client.environments.length > 0 ? (
                        client.environments.slice(0, 3).map((env) => (
                          <span
                            key={env.id}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTierColor(
                              env.name
                            )}`}
                          >
                            {env.name.slice(0, 4)}: {isShowing ? "••••" : env.host.split(".")[0]}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">
                          Click below to provision environments
                        </span>
                      )}
                      {envCount > 3 && (
                        <span className="text-[10px] font-bold text-gray-400 self-center">
                          +{envCount - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <button
                    onClick={() => handleSelectClient(client)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-[#18191E] text-gray-700 hover:text-white rounded-xl text-xs font-bold transition shadow-2xs group-hover:bg-[#18191E] group-hover:text-white"
                  >
                    <span>Manage Environments</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredClients.length === 0 && !isLoading && (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">No matching clients found</p>
              <p className="text-xs text-gray-400 mt-1">Try another search keyword or register a new client.</p>
            </div>
          )}
        </div>
      ) : (
        /* ======================== SELECTED CLIENT ENVIRONMENTS VIEW ======================== */
        <div className="space-y-6">
          {/* Selected Client Summary Card */}
          <div className="bg-[#18191E] text-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6C22] text-white flex items-center justify-center text-lg font-mono font-black shadow-md">
                {selectedClient.code.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">
                    {isShowing && selectedClient.showingAlias ? selectedClient.showingAlias : selectedClient.name}
                  </h3>
                  <span className="bg-white/10 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {selectedClient.code}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>Industry: {selectedClient.industry}</span>
                  <span>•</span>
                  <span>Alias: {selectedClient.showingAlias || "None"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCreateEnvOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6C22] text-white hover:bg-[#FF7A29] transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Environment</span>
              </button>
            </div>
          </div>

          {/* Environments Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-500" />
                <h4 className="font-bold text-sm text-[#111827]">Server Environments</h4>
                <span className="text-xs text-gray-400 font-mono">
                  ({selectedClient.environments?.length ?? 0})
                </span>
              </div>
              {isShowing && (
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Hostnames & ports sanitized for live audience
                </span>
              )}
            </div>

            {selectedClient.environments && selectedClient.environments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {selectedClient.environments.map((env) => (
                  <div
                    key={env.id}
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/60 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl border ${getTierColor(
                          env.name
                        )}`}
                      >
                        {env.name}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-gray-900">
                            {isShowing ? "••••••••••••" : env.host}
                          </span>
                          <span className="text-gray-400 font-mono text-xs">:</span>
                          <span className="font-mono text-xs text-[#FF6C22] font-semibold">
                            {isShowing ? "••••" : env.port}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ID: {env.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {env.isProtected ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-xl text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Protected Tier</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-xs font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                          <span>Standard Dev</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteEnvironment(env.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete environment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center space-y-2">
                <Server className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No environments provisioned yet</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Provision Development, Staging, UAT, or Production servers to attach databases and API keys to this client.
                </p>
                <button
                  onClick={() => setIsCreateEnvOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6C22] text-white hover:bg-[#FF7A29] transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Provision First Environment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODALS */}
      {/* ======================================================== */}
      <CreateClientModal
        isOpen={isCreateClientOpen}
        onClose={() => setIsCreateClientOpen(false)}
        onSuccess={fetchClients}
        isShowing={isShowing}
      />

      {selectedClient && (
        <CreateEnvironmentModal
          isOpen={isCreateEnvOpen}
          onClose={() => setIsCreateEnvOpen(false)}
          onSuccess={fetchClients}
          clientId={selectedClient.id}
          clientName={isShowing && selectedClient.showingAlias ? selectedClient.showingAlias : selectedClient.name}
          isShowing={isShowing}
        />
      )}
    </div>
  );
}
