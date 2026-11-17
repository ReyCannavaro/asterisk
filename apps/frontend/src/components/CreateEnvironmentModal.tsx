import React, { useState } from "react";
import { X, Server, ShieldCheck, ShieldAlert, Check } from "lucide-react";
import { api } from "../lib/eden";

interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
  isShowing: boolean;
}

export function CreateEnvironmentModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
  isShowing,
}: CreateEnvironmentModalProps) {
  const [envName, setEnvName] = useState<"DEVELOPMENT" | "STAGING" | "UAT" | "PRODUCTION">("DEVELOPMENT");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number>(5432);
  const [isProtected, setIsProtected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnvNameChange = (val: "DEVELOPMENT" | "STAGING" | "UAT" | "PRODUCTION") => {
    setEnvName(val);
    if (val === "PRODUCTION" || val === "UAT") {
      setIsProtected(true);
    } else {
      setIsProtected(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !port) {
      setErrorMessage("Host and Port are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.api.clients({ id: clientId }).environments.post({
        name: envName,
        host: host.trim(),
        port: Number(port),
        isProtected,
      });

      if (response.error) {
        setErrorMessage(typeof response.error.value === "string" ? response.error.value : "Failed to create environment.");
        setIsSubmitting(false);
        return;
      }

      setHost("");
      setPort(5432);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to communicate with Asterisk API.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-[28px] w-full max-w-md border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#18191E] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/20 border border-[#FF6C22]/30 flex items-center justify-center text-[#FF6C22]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Add Server Environment</h3>
              <p className="text-xs text-gray-400 font-mono truncate max-w-[240px]">
                Target: {clientName}
              </p>
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

          {/* Environment Type Segmented Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Environment Tier</label>
            <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-2xl border border-gray-200">
              {(["DEVELOPMENT", "STAGING", "UAT", "PRODUCTION"] as const).map((tier) => {
                const isSelected = envName === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleEnvNameChange(tier)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl transition ${
                      isSelected
                        ? "bg-[#18191E] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tier === "DEVELOPMENT" ? "DEV" : tier === "PRODUCTION" ? "PROD" : tier}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host & Port Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                Server Host / IP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="10.20.1.15 or db.internal.client.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C22]"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="5432"
                min={1}
                max={65535}
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C22]"
              />
            </div>
          </div>

          {/* Protection Toggle */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isProtected ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  High Impact Isolation
                </span>
                <span className="text-[10px] text-gray-500">
                  {isProtected ? "Protected: Requires elevated audit clearance" : "Standard development environment"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsProtected(!isProtected)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                isProtected ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
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
                <span>Adding...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Add Environment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
