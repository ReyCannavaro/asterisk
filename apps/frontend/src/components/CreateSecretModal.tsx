import React, { useState, useEffect } from "react";
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Database, 
  Server, 
  Terminal, 
  Cloud, 
  Lock,
  Building2
} from "lucide-react";
import { api } from "../lib/eden";
import type { Client, Environment, CredentialType } from "@asterisk/types";

interface CreateSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isShowing: boolean;
}

const SECRET_TYPES: { id: CredentialType; label: string; icon: any; placeholder: string }[] = [
  { id: "POSTGRES_PASSWORD", label: "PostgreSQL Database", icon: Database, placeholder: "postgres://user:pass@host:5432/dbname" },
  { id: "API_MASTER_TOKEN", label: "API Master Token", icon: KeyRound, placeholder: "ak_live_99a8b7c6d5e4f3a2b1..." },
  { id: "SSH_PRIVATE_KEY", label: "SSH Private Key", icon: Terminal, placeholder: "-----BEGIN OPENSSH PRIVATE KEY-----\n..." },
  { id: "ENV_SECRET", label: "Environment Secret", icon: Lock, placeholder: "JWT_SECRET=super_secret_value_here" },
  { id: "AWS_ACCESS_KEY", label: "Cloud Access Credential", icon: Cloud, placeholder: "AKIAIOSFODNN7EXAMPLE" },
];

export function CreateSecretModal({
  isOpen,
  onClose,
  onSuccess,
  isShowing,
}: CreateSecretModalProps) {
  const [clientsList, setClientsList] = useState<Array<Client & { environments?: Environment[] }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<CredentialType>("POSTGRES_PASSWORD");
  const [plaintext, setPlaintext] = useState<string>("");
  const [isPlaintextVisible, setIsPlaintextVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients & their environments when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    api.api.clients.get({
      headers: { "x-asterisk-showing-mode": String(isShowing) },
    })
      .then((res) => {
        if (!isMounted) return;
        if (res.data && Array.isArray(res.data)) {
          const list = res.data as Array<Client & { environments?: Environment[] }>;
          setClientsList(list);
          if (list.length > 0) {
            setSelectedClientId(list[0].id);
            if (list[0].environments && list[0].environments.length > 0) {
              setSelectedEnvironmentId(list[0].environments[0].id);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("[Asterisk] Failed to fetch clients for secret modal:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, isShowing]);

  // Update selected environment when client changes
  useEffect(() => {
    const currentClient = clientsList.find((c) => c.id === selectedClientId);
    if (currentClient && currentClient.environments && currentClient.environments.length > 0) {
      setSelectedEnvironmentId(currentClient.environments[0].id);
    } else {
      setSelectedEnvironmentId("");
    }
  }, [selectedClientId, clientsList]);

  if (!isOpen) return null;

  const currentClient = clientsList.find((c) => c.id === selectedClientId);
  const availableEnvironments = currentClient?.environments || [];
  const currentTypeConfig = SECRET_TYPES.find((t) => t.id === type) || SECRET_TYPES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnvironmentId) {
      setError("Please select an environment (or create one under Clients & Envs first).");
      return;
    }
    if (!name.trim()) {
      setError("Please provide a name for this secret.");
      return;
    }
    if (!plaintext.trim()) {
      setError("Please provide the credential value to encrypt.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.api.vault.post({
        environmentId: selectedEnvironmentId,
        name: name.trim(),
        type: type,
        plaintext: plaintext.trim(),
      }, {
        headers: {
          "x-asterisk-showing-mode": String(isShowing),
        },
      });

      if (response.error) {
        setError((response.error.value as any)?.message || "Failed to store secret in vault");
      } else {
        setName("");
        setPlaintext("");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to encrypt and save secret");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18191E] border border-white/10 text-white rounded-[28px] w-full max-w-lg shadow-2xl p-6 relative overflow-hidden">
        {/* Subtle orange accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6C22]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/10 border border-[#FF6C22]/20 flex items-center justify-center text-[#FF6C22]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Store Vault Secret</h2>
              <p className="text-xs text-white/50">AES-256-GCM Zero-Leak Hardware Encrypted</p>
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

          {/* Client & Environment Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Target Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              >
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isShowing && c.showingAlias ? c.showingAlias : c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Target Environment
              </label>
              <select
                value={selectedEnvironmentId}
                onChange={(e) => setSelectedEnvironmentId(e.target.value)}
                disabled={availableEnvironments.length === 0}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22] disabled:opacity-50"
              >
                {availableEnvironments.length > 0 ? (
                  availableEnvironments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name} ({env.host}:{env.port})
                    </option>
                  ))
                ) : (
                  <option value="">No environments found</option>
                )}
              </select>
            </div>
          </div>

          {/* Secret Type Selector */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Secret Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SECRET_TYPES.map((t) => {
                const IconComp = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#FF6C22]/10 border-[#FF6C22] text-white"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isSelected ? "text-[#FF6C22]" : "text-white/40"}`} />
                    <span className="text-[11px] font-semibold truncate w-full">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secret Name */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Secret Label / Identifier
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Production PostgreSQL Master Password"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22]"
            />
          </div>

          {/* Plaintext Secret Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/70">
                Credential Value (To be Encrypted)
              </label>
              <button
                type="button"
                onClick={() => setIsPlaintextVisible(!isPlaintextVisible)}
                className="text-[11px] text-white/50 hover:text-white flex items-center gap-1"
              >
                {isPlaintextVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{isPlaintextVisible ? "Hide" : "Show"}</span>
              </button>
            </div>
            <div className="relative">
              <textarea
                required
                rows={3}
                placeholder={currentTypeConfig.placeholder}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22] resize-none"
              />
            </div>
          </div>

          {/* Cryptographic notice */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-2.5 text-[11px] text-white/50 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#FF6C22] shrink-0 mt-0.5" />
            <div>
              <span>Stored using <strong className="text-white font-mono">AES-256-GCM</strong> with isolated 96-bit CSPRNG IVs. Master key never touches DB or git repository.</span>
            </div>
          </div>

          {/* Action Buttons */}
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
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt & Store Secret</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
