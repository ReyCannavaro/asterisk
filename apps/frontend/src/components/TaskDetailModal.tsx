import React, { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Building2
} from "lucide-react";
import { api } from "../lib/eden";
import type { TaskStatus, TaskModuleTag, TaskActivity, FeedbackCategory, FeedbackSeverity } from "@asterisk/types";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  isShowing: boolean;
  onTaskUpdated: () => void;
}

interface TaskDetailData {
  id: string;
  clientId: string;
  title: string;
  description?: string | null;
  moduleTag: TaskModuleTag;
  status: TaskStatus;
  assignedTo?: string | null;
  assignedToName?: string;
  assignedToAvatar?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  clientCode?: string;
  clientName?: string;
  clientShowingAlias?: string;
  sourceFeedback?: {
    id: string;
    category: FeedbackCategory;
    description: string;
    severity: FeedbackSeverity;
    createdAt: string;
  } | null;
  activities: TaskActivity[];
}

export function TaskDetailModal({
  isOpen,
  onClose,
  taskId,
  isShowing,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const loadTask = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.api.tasks({ id }).get({
        headers: { "x-asterisk-showing-mode": String(isShowing) },
      });
      if (response.data && !("error" in response.data)) {
        setTask(response.data as unknown as TaskDetailData);
      }
    } catch (err) {
      console.warn("[Asterisk] Failed to load task detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadTask(taskId);
    } else {
      setTask(null);
      setCommentInput("");
    }
  }, [isOpen, taskId, isShowing]);

  if (!isOpen || !taskId) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      await api.api.tasks({ id: task.id }).status.patch({
        status: newStatus,
        comment: `Updated status from ${task.status} to ${newStatus}`,
      });
      loadTask(task.id);
      onTaskUpdated();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentInput.trim()) return;

    setIsSubmittingComment(true);
    try {
      await api.api.tasks({ id: task.id }).activities.post({
        comment: commentInput.trim(),
      });
      setCommentInput("");
      loadTask(task.id);
      onTaskUpdated();
    } catch (err: any) {
      alert("Failed to post comment: " + err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.api.tasks({ id: task.id }).delete();
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      alert("Failed to delete task: " + err.message);
    }
  };

  const getModuleBadgeStyle = (tag: TaskModuleTag) => {
    switch (tag) {
      case "PAYROLL":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "SECURITY":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "ATTENDANCE":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20";
      case "CLAIM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-[#FF6C22]/10 text-[#FF6C22] border-[#FF6C22]/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18191E] border border-white/10 text-white rounded-[28px] w-full max-w-2xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top orange accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6C22]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${task ? getModuleBadgeStyle(task.moduleTag) : ""}`}>
              {task?.moduleTag || "TASK"}
            </span>

            {task && (
              <span className="text-xs text-white/50 flex items-center gap-1 font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>{isShowing && task.clientShowingAlias ? task.clientShowingAlias : task.clientName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteTask}
              title="Delete Task"
              className="p-1.5 rounded-full hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="py-5 space-y-5 overflow-y-auto pr-1 flex-1">
          {isLoading && !task ? (
            <div className="py-12 flex justify-center">
              <div className="w-7 h-7 border-2 border-[#FF6C22] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : task ? (
            <>
              {/* Title & Status Pills */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {task.title}
                  </h2>

                  {/* Status Switcher Pills */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl shrink-0 border border-white/5">
                    {(["TODO", "IN_PROGRESS", "REVIEW_QA", "COMPLETE"] as TaskStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          task.status === st
                            ? st === "COMPLETE"
                              ? "bg-emerald-500 text-white shadow-xs"
                              : st === "IN_PROGRESS"
                              ? "bg-sky-500 text-white shadow-xs"
                              : st === "REVIEW_QA"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-[#FF6C22] text-white shadow-xs"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-white/70 bg-black/30 p-3.5 rounded-2xl border border-white/5 leading-relaxed whitespace-pre-line">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Source Showing Feedback Banner (if converted from Showing) */}
              {task.sourceFeedback && (
                <div className="p-4 rounded-2xl bg-[#FF6C22]/10 border border-[#FF6C22]/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FF6C22]" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                      Converted From Client Showing Feedback
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FF6C22]/20 text-[#FF6C22] text-[10px] font-bold">
                      {task.sourceFeedback.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                    "{task.sourceFeedback.description}"
                  </p>
                </div>
              )}

              {/* Meta Grid: Assignee, Due Date, Created */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Assignee</span>
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#FF6C22] text-white text-[9px] font-bold flex items-center justify-center">
                      RC
                    </div>
                    <span>{task.assignedToName || "Rey Cannavaro"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Target Due Date</span>
                  <div className="flex items-center gap-1 text-white font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6C22]" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Flexible Sprint"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Created At</span>
                  <span className="text-white/60 font-mono">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Activity Timeline Section */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Activity Timeline & Comments ({task.activities.length})
                </span>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {task.activities.length === 0 ? (
                    <p className="text-xs text-white/40 py-4 text-center">No activity history recorded yet.</p>
                  ) : (
                    task.activities.map((act) => (
                      <div key={act.id} className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-white/90">
                            {act.userFullName || "Rey Cannavaro"}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(act.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                          {act.comment || act.action}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Box Form */}
                <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a progress note or QA update..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/5 flex justify-end shrink-0">
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
