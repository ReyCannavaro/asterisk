import React, { useState } from "react";
import { X, Building2, Shield, Sparkles, Check } from "lucide-react";
import { api } from "../lib/eden";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isShowing: boolean;
}

export function CreateClientModal({ isOpen, onClose, onSuccess, isShowing }: CreateClientModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology & Software");
  const [showingAlias, setShowingAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const industries = [
    "Banking & Finance",
    "Energy & Mining",
    "Telecommunications",
    "Consumer Goods & FMCG",
    "Technology & Software",
    "Healthcare & Pharma",
    "Manufacturing",
    "Public Sector",
  ];

  // Auto-generate showing alias suggestion when code or industry changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCode(val);
    if (!showingAlias || showingAlias.startsWith("Client-")) {
      const indShort = industry.split(" ")[0];
      setShowingAlias(`Client-${val} (${indShort})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      setErrorMessage("Client Code and Company Name are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.api.clients.post({
        code: code.trim(),
        name: name.trim(),
        industry: industry.trim(),
        showingAlias: showingAlias.trim() || undefined,
        isActive: true,
      });

      if (response.error) {
        setErrorMessage(typeof response.error.value === "string" ? response.error.value : "Failed to create client.");
        setIsSubmitting(false);
        return;
      }

      // Reset and close
      setCode("");
      setName("");
      setShowingAlias("");
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Network error while connecting to Asterisk API.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-[28px] w-full max-w-lg border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#18191E] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/20 border border-[#FF6C22]/30 flex items-center justify-center text-[#FF6C22]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Register New Client</h3>
              <p className="text-xs text-gray-400 font-mono">Multi-Tenant Tenant Provisioning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {/* Client Code */}
            <div className="col-span-1 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                Client Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="GOTO"
                maxLength={10}
                value={code}
                onChange={handleCodeChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C22]"
              />
            </div>

            {/* Industry */}
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C22]"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Company Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              Official Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. PT GoTo Gojek Tokopedia Tbk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C22]"
            />
          </div>

          {/* Showing Mode Alias */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FF6C22]" />
                <span>Showing Alias (Anti-Leak Mask)</span>
              </label>
              <span className="text-[10px] text-gray-400 font-mono">Used during live demo</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Client-E (Tech)"
              value={showingAlias}
              onChange={(e) => setShowingAlias(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C22]"
            />
          </div>

          {/* Showing Mode Preview Box */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Anti-Leak Preview Simulator:
              </span>
              <span className="font-mono text-[10px]">
                {isShowing ? "Showing: ON" : "Showing: OFF"}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-500 font-medium">Display on Portal:</span>
              <span className="font-bold text-gray-900">
                {isShowing ? (showingAlias || "••••••••••••") : (name || "Company Name")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF6C22] text-white hover:bg-[#FF7A29] transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Register Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
