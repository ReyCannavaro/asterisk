import React, { useState, useEffect } from "react";
import { X, CheckSquare, Calendar, Building2, User } from "lucide-react";
import { api } from "../lib/eden";
import type { Client, TaskModuleTag, TaskStatus } from "@asterisk/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isShowing: boolean;
  defaultStatus?: TaskStatus;
}

const MODULE_OPTIONS: { id: TaskModuleTag; label: string }[] = [
  { id: "PAYROLL", label: "Payroll & Tax (PPh 21)" },
  { id: "SECURITY", label: "Security & Vault SSO" },
  { id: "ATTENDANCE", label: "Attendance & Shift" },
  { id: "CLAIM", label: "Claims & Reimbursement" },
  { id: "MASTER", label: "Master Organization" },
  { id: "DEV", label: "Backend API & Database" },
  { id: "DESIGN", label: "UI/UX & Design Tokens" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  isShowing,
  defaultStatus = "TODO",
}: CreateTaskModalProps) {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [moduleTag, setModuleTag] = useState<TaskModuleTag>("PAYROLL");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

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
        console.warn("[Asterisk] Failed to fetch clients for create task modal:", err);
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
      setError("Please provide a task title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.api.tasks.post({
        clientId: selectedClientId,
        title: title.trim(),
        description: description.trim() || undefined,
        moduleTag: moduleTag,
        status: status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignedTo: "user-rey-superadmin",
        positionOrder: 1,
      });

      if (response.error) {
        setError((response.error.value as any)?.message || "Failed to create task");
      } else {
        setTitle("");
        setDescription("");
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
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Create Kanban Task</h2>
              <p className="text-xs text-white/50">Add new delivery ticket to pipeline</p>
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

          {/* Client & Module Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Client Tenant
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
                Module Category
              </label>
              <select
                value={moduleTag}
                onChange={(e) => setModuleTag(e.target.value as TaskModuleTag)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              >
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Task Title / Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Shift 3 Night Overtime Multiplier"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22]"
            />
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Initial Pipeline Column
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              >
                <option value="TODO">To Do (Backlog)</option>
                <option value="IN_PROGRESS">In Progress (Active Dev)</option>
                <option value="REVIEW_QA">Review QA (Testing)</option>
                <option value="COMPLETE">Complete (Shipped)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6C22]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Task Details & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Technical specs, acceptance criteria, edge cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#06080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22] resize-none"
            />
          </div>

          {/* Assignee indicator */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF6C22]" />
              <span>Assigned To:</span>
              <strong className="text-white">Rey Cannavaro (Lead PM)</strong>
            </div>
            <span className="text-[11px] font-mono text-[#FF6C22]">LEAD OWNER</span>
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Add to Kanban</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
