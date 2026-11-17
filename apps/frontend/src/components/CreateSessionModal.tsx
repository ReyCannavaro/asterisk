import React, { useState, useEffect } from "react";
import { X, Tv, Calendar, User } from "lucide-react";
import { api } from "../lib/eden";
import type { Client } from "@asterisk/types";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isShowing: boolean;
}

export function CreateSessionModal({
  isOpen,
  onClose,
  onSuccess,
  isShowing,
}: CreateSessionModalProps) {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [status, setStatus] = useState<string>("SCHEDULED");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default datetime to now
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setScheduledAt(now.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  // Fetch clients for dropdown
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    api.api.clients.get({
      headers: { "x-asterisk-showing-mode": String(isShowing) },
    })
      .then((res) => {
        if (!isMounted) return;
        if (res.data && Array.isArray(res.data)) {
          const list = res.data as Client[];
          setClientsList(list);
          if (list.length > 0 && !selectedClientId) {
            setSelectedClientId(list[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn("[Asterisk] Failed to fetch clients for session modal:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, isShowing]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setError("Please select a target client.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a session title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.api.showing.sessions.post({
        clientId: selectedClientId,
        title: title.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        status: status,
        notes: notes.trim() || undefined,
        conductedBy: "user-rey-superadmin",
      });

      if (response.error) {
        setError((response.error.value as any)?.message || "Failed to schedule session");
      } else {
        setTitle("");
        setNotes("");
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
      <div className="bg-[#18191E] border border-white/10 text-white rounded-[28px] w-full max-w-lg shadow-2xl p-6 relative overflow-hidden">
        {/* Top orange accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6C22]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C22]/10 border border-[#FF6C22]/20 flex items-center justify-center text-[#FF6C22]">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Schedule Showing Session</h2>
              <p className="text-xs text-white/50">Plan and coordinate a live client demonstration</p>
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

          {/* Target Client */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Client Stakeholder
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
            >
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {isShowing && c.showingAlias ? c.showingAlias : c.name} ({c.code}) · {c.industry}
                </option>
              ))}
            </select>
          </div>

          {/* Session Title */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Session Agenda / Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sprint 14 HRIS Overtime Calculation & Attendance Demo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22]"
            />
          </div>

          {/* Schedule Date & Initial Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              >
                <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                <option value="ACTIVE">ACTIVE (Start Demo Now)</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Notes & Focus Modules */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Meeting Scope & Demonstration Notes
            </label>
            <textarea
              rows={3}
              placeholder="Highlight modules to present: Attendance Biometric, Payroll tax rate formula PPh 21 TER, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22] resize-none"
            />
          </div>

          {/* Conductor Badge */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF6C22]" />
              <span>Conducted By:</span>
              <strong className="text-white">Rey Cannavaro (Lead PM)</strong>
            </div>
            <span className="text-[11px] font-mono text-[#FF6C22]">ASTERISK HOST</span>
          </div>

          {/* Modal Actions */}
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
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Tv className="w-3.5 h-3.5" />
                  <span>Create Showing Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
