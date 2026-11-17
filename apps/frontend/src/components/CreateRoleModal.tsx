import React, { useState, useEffect } from "react";
import { X, Shield, Check, Lock, ShieldCheck, CheckSquare, Layers } from "lucide-react";
import { api } from "../lib/eden";
import type { Permission } from "@asterisk/types";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    api.api.permissions.get()
      .then((res) => {
        if (!isMounted) return;
        if (res.data && Array.isArray(res.data)) {
          setAllPermissions(res.data as unknown as Permission[]);
        }
      })
      .catch((err) => {
        console.warn("[Asterisk] Failed to fetch permissions:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePerm = (permId: string) => {
    const next = new Set(selectedPerms);
    if (next.has(permId)) {
      next.delete(permId);
    } else {
      next.add(permId);
    }
    setSelectedPerms(next);
  };

  const handleToggleCategory = (permsInCategory: Permission[]) => {
    const allSelected = permsInCategory.every((p) => selectedPerms.has(p.id));
    const next = new Set(selectedPerms);
    if (allSelected) {
      permsInCategory.forEach((p) => next.delete(p.id));
    } else {
      permsInCategory.forEach((p) => next.add(p.id));
    }
    setSelectedPerms(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a role name.");
      return;
    }
    if (selectedPerms.size === 0) {
      setError("Please assign at least one permission to this role.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.api.roles.post({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: Array.from(selectedPerms),
      });

      if (response.error) {
        setError((response.error.value as any)?.message || "Failed to create role");
      } else {
        setName("");
        setDescription("");
        setSelectedPerms(new Set());
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group permissions by resource
  const groupedPerms = allPermissions.reduce((acc, p) => {
    const key = p.resource.toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18191E] border border-white/10 text-white rounded-[28px] w-full max-w-xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top orange accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6C22]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/10 border border-[#FF6C22]/20 flex items-center justify-center text-[#FF6C22]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Create Custom Role</h2>
              <p className="text-xs text-white/50">Define role identifier and granular RBAC permissions</p>
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
        <form onSubmit={handleSubmit} className="py-5 space-y-4 overflow-y-auto pr-1 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Role Name */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Role Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lead QA Specialist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Role Scope Description
            </label>
            <input
              type="text"
              placeholder="e.g. Oversees QA verification for all HRIS mining shift formulas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22]"
            />
          </div>

          {/* Granular Permissions Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Granular Permissions ({selectedPerms.size} selected)
              </span>
              <span className="text-[10px] text-white/40 font-mono">DYNAMIC RBAC MATRIX</span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {Object.entries(groupedPerms).map(([category, perms]) => {
                const allSelected = perms.every((p) => selectedPerms.has(p.id));

                return (
                  <div key={category} className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FF6C22] tracking-wide">
                        {category} MODULE
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(perms)}
                        className="text-[10px] text-white/40 hover:text-white underline font-mono"
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {perms.map((p) => {
                        const isChecked = selectedPerms.has(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleTogglePerm(p.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                              isChecked
                                ? "bg-[#FF6C22]/10 border-[#FF6C22]/40 text-white"
                                : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked ? "bg-[#FF6C22] border-[#FF6C22] text-white" : "border-white/20"
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-[11px] font-mono truncate">{p.id}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
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
                  <span>Creating Role...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Save Custom Role</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
