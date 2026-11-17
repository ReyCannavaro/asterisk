import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  Clock, 
  AlertTriangle
} from "lucide-react";
import { api } from "../lib/eden";

interface RevealSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  secretId: string | null;
  secretName: string;
  secretType: string;
  environmentName: string;
  clientName: string;
  isShowing: boolean;
  onAuditCreated?: () => void;
}

export function RevealSecretModal({
  isOpen,
  onClose,
  secretId,
  secretName,
  secretType,
  environmentName,
  clientName,
  isShowing,
  onAuditCreated,
}: RevealSecretModalProps) {
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPlainVisible, setIsPlainVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    if (!isOpen || !secretId) {
      setPlaintext(null);
      setError(null);
      setIsCopied(false);
      setTimeLeft(15);
      return;
    }

    if (isShowing) {
      setPlaintext(null);
      return;
    }

    // Fetch decrypted value
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api.api.vault({ id: secretId }).reveal.post({}, {
      headers: {
        "x-asterisk-showing-mode": String(isShowing),
      },
    })
      .then((res) => {
        if (!isMounted) return;
        if (res.error) {
          setError((res.error.value as any)?.message || "Failed to decrypt secret");
        } else if (res.data && "plaintext" in res.data) {
          setPlaintext((res.data as any).plaintext);
          if (onAuditCreated) onAuditCreated();
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to connect to vault");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, secretId, isShowing]);

  // Auto-mask countdown timer
  useEffect(() => {
    if (!isOpen || isShowing || !plaintext) return;

    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isShowing, plaintext, timeLeft, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!plaintext) return;
    navigator.clipboard.writeText(plaintext);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18191E] border border-white/10 text-white rounded-[28px] w-full max-w-lg shadow-2xl p-6 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isShowing ? "bg-amber-500" : "bg-[#FF6C22]"}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isShowing ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-[#FF6C22]/10 text-[#FF6C22] border border-[#FF6C22]/20"
            }`}>
              {isShowing ? <ShieldAlert className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isShowing ? "Decryption Shield Active" : "Reveal Vault Secret"}
              </h2>
              <p className="text-xs text-white/50">{clientName} · {environmentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-4">
          {/* If Showing Mode is ON: Hard Barrier Warning */}
          {isShowing ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    Zero-Leak Shield Block
                  </h3>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Showing Mode is currently active to safeguard sensitive client credentials during live demonstrations and screen-sharing sessions.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-white/50 flex items-center justify-between">
                <span>Secret Name:</span>
                <span className="text-white font-medium">{secretName}</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-white/50 flex items-center justify-between">
                <span>Value:</span>
                <span className="text-amber-400 font-bold tracking-widest">••••••••••••••••</span>
              </div>

              <p className="text-[11px] text-white/40 italic">
                Tip: Toggle Showing Mode off using <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl+Shift+S</kbd> to decrypt raw credentials.
              </p>
            </div>
          ) : (
            /* If Showing Mode is OFF: Reveal Flow */
            <div className="space-y-4">
              {isLoading && (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#FF6C22] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-white/50 font-mono">Authenticating AES-256-GCM cipher...</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {plaintext && !isLoading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Target Secret:</span>
                    <span className="font-semibold text-white">{secretName} ({secretType})</span>
                  </div>

                  {/* Secret Display Box */}
                  <div className="relative group bg-[#06080D] border border-white/10 rounded-2xl p-4 font-mono text-xs break-all selection:bg-[#FF6C22]/30">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-white font-medium tracking-wide">
                        {isPlainVisible ? plaintext : "••••••••••••••••••••••••"}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setIsPlainVisible(!isPlainVisible)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title={isPlainVisible ? "Mask value" : "Show plaintext"}
                        >
                          {isPlainVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="p-1.5 rounded-lg bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white transition-colors flex items-center gap-1 font-sans text-xs px-2.5 font-medium shadow-sm"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auto-mask Hygiene Timer */}
                  <div className="flex items-center justify-between text-[11px] text-white/50 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Security Auto-Close Timer:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">{timeLeft}s remaining</span>
                  </div>

                  {/* Immutable Audit notice */}
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Logged to immutable audit trail: <strong className="font-mono">VAULT_DECRYPT</strong> by Rey Cannavaro</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
