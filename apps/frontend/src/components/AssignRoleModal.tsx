import React, { useState, useEffect } from "react";
import { X, Shield, Building2, User, CheckCircle2 } from "lucide-react";
import { api } from "../lib/eden";
import type { Role, Client } from "@asterisk/types";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string | null;
  userName: string;
}

export function AssignRoleModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
}: AssignRoleModalProps) {
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [scopeType, setScopeType] = useState<"PLATFORM" | "CLIENT">("PLATFORM");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    Promise.all([api.api.roles.get(), api.api.clients.get()])
      .then(([rolesRes, clientsRes]) => {
        if (!isMounted) return;
        if (rolesRes.data && Array.isArray(rolesRes.data)) {
          const list = rolesRes.data as unknown as Role[];
          setRolesList(list);
          if (list.length > 0 && !selectedRoleId) {
            setSelectedRoleId(list[0].id);
          }
        }
        if (clientsRes.data && Array.isArray(clientsRes.data)) {
          const cList = clientsRes.data as unknown as Client[];
          setClientsList(cList);
          if (cList.length > 0 && !selectedClientId) {
            setSelectedClientId(cList[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn("[Asterisk] Failed to load roles/clients for assignment:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen || !userId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setError("Please select a role to assign.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.api.users({ id: userId }).roles.post({
        roleId: selectedRoleId,
        clientId: scopeType === "CLIENT" ? selectedClientId : undefined,
      });

      if (response.error) {
        setError((response.error.value as any)?.message || "Failed to assign role");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18191E] border border-white/10 text-white rounded-[28px] w-full max-w-md shadow-2xl p-6 relative overflow-hidden">
        {/* Top orange accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6C22]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/10 border border-[#FF6C22]/20 flex items-center justify-center text-[#FF6C22]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Assign Dual-Tier Role</h2>
              <p className="text-xs text-white/50">Target User: <strong className="text-white">{userName}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Select Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id}) {r.isSystem ? "· [SYSTEM]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Scope Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Role Authority Scope
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setScopeType("PLATFORM")}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  scopeType === "PLATFORM"
                    ? "bg-[#FF6C22]/10 border-[#FF6C22] text-white"
                    : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                Platform-Wide
              </button>
              <button
                type="button"
                onClick={() => setScopeType("CLIENT")}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  scopeType === "CLIENT"
                    ? "bg-[#FF6C22]/10 border-[#FF6C22] text-white"
                    : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                Client Tenant Scoped
              </button>
            </div>
          </div>

          {/* If Client Scoped: Select Tenant */}
          {scopeType === "CLIENT" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-white/70">
                Target Enterprise Tenant
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              >
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-white/40 italic">
                User will only hold authority inside this client's environment and roadmap.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
