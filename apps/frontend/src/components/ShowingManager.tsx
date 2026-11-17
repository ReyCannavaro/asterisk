import React, { useState, useEffect } from "react";
import { 
  Tv, 
  Calendar, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  ShieldAlert, 
  RefreshCw, 
  Send, 
  Zap 
} from "lucide-react";
import { api } from "../lib/eden";
import { CreateSessionModal } from "./CreateSessionModal";
import type { 
  ShowingStatus, 
  FeedbackCategory, 
  FeedbackSeverity, 
  FeedbackStatus 
} from "@asterisk/types";

interface ShowingManagerProps {
  isShowing: boolean;
  onNavigateToTasks?: () => void;
}

interface ShowingSessionItem {
  id: string;
  clientId: string;
  conductedBy: string;
  conductedByName?: string;
  title: string;
  scheduledAt: string;
  status: ShowingStatus;
  notes?: string | null;
  createdAt: string;
  clientCode?: string;
  clientName?: string;
  clientShowingAlias?: string;
  clientIndustry?: string;
  feedbacksCount?: number;
  convertedTasksCount?: number;
}

interface FeedbackItem {
  id: string;
  sessionId: string;
  category: FeedbackCategory;
  description: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  createdAt: string;
}

export function ShowingManager({ isShowing, onNavigateToTasks }: ShowingManagerProps) {
  const [sessions, setSessions] = useState<ShowingSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbacksLoading, setIsFeedbacksLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Quick feedback form state
  const [quickCategory, setQuickCategory] = useState<FeedbackCategory>("SHOWING_ENHANCEMENT");
  const [quickSeverity, setQuickSeverity] = useState<FeedbackSeverity>("MEDIUM");
  const [quickDescription, setQuickDescription] = useState("");
  const [isLoggingFeedback, setIsLoggingFeedback] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load showing sessions
  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await api.api.showing.sessions.get({
        headers: { "x-asterisk-showing-mode": String(isShowing) },
      });

      if (response.data && Array.isArray(response.data)) {
        const list = response.data as unknown as ShowingSessionItem[];
        setSessions(list);
        if (list.length > 0 && !selectedSessionId) {
          // Select ACTIVE session first if available, else first in list
          const active = list.find((s) => s.status === "ACTIVE");
          setSelectedSessionId(active ? active.id : list[0].id);
        }
      }
    } catch (err) {
      console.warn("[Asterisk Showing] Failed to load sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load feedbacks for selected session
  const loadFeedbacks = async (sessionId: string) => {
    setIsFeedbacksLoading(true);
    try {
      const response = await api.api.showing.sessions({ id: sessionId }).feedbacks.get();
      if (response.data && Array.isArray(response.data)) {
        setFeedbacks(response.data as unknown as FeedbackItem[]);
      }
    } catch (err) {
      console.warn("[Asterisk Showing] Failed to load feedbacks:", err);
    } finally {
      setIsFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [isShowing]);

  useEffect(() => {
    if (selectedSessionId) {
      loadFeedbacks(selectedSessionId);
    } else {
      setFeedbacks([]);
    }
  }, [selectedSessionId]);

  // Handle Quick Feedback Submission
  const handleLogFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) {
      alert("Please select or start a showing session first.");
      return;
    }
    if (!quickDescription.trim()) return;

    setIsLoggingFeedback(true);
    try {
      const response = await api.api.showing.sessions({ id: selectedSessionId }).feedbacks.post({
        category: quickCategory,
        severity: quickSeverity,
        description: quickDescription.trim(),
      });

      if (response.data) {
        setQuickDescription("");
        showToast("Client feedback captured in live stream!");
        loadFeedbacks(selectedSessionId);
        loadSessions();
      }
    } catch (err: any) {
      alert("Failed to log feedback: " + err.message);
    } finally {
      setIsLoggingFeedback(false);
    }
  };

  // Handle 1-Click Convert Feedback to Task
  const handleConvertToTask = async (feedback: FeedbackItem) => {
    setConvertingId(feedback.id);
    try {
      const response = await api.api.showing.feedbacks({ feedbackId: feedback.id })["convert-to-task"].post({});

      if (response.data) {
        showToast(`Feedback converted to Kanban task: ${(response.data as any).task.title}`);
        loadFeedbacks(selectedSessionId!);
        loadSessions();
      }
    } catch (err: any) {
      alert("Failed to convert feedback to task: " + err.message);
    } finally {
      setConvertingId(null);
    }
  };

  // Update session status (e.g. Start Session, Finish)
  const handleUpdateStatus = async (sessionId: string, newStatus: ShowingStatus) => {
    try {
      await api.api.showing.sessions({ id: sessionId }).status.patch({
        status: newStatus,
      });
      showToast(`Session status updated to ${newStatus}`);
      loadSessions();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this showing session and its feedbacks?")) return;
    try {
      await api.api.showing.sessions({ id: sessionId }).delete();
      setSelectedSessionId(null);
      loadSessions();
      showToast("Session deleted.");
    } catch (err: any) {
      alert("Failed to delete session: " + err.message);
    }
  };

  // Selected session object
  const activeSession = sessions.find((s) => s.status === "ACTIVE");
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || activeSession || sessions[0];

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === "ALL") return true;
    return s.status === statusFilter;
  });

  const getCategoryBadge = (cat: FeedbackCategory) => {
    switch (cat) {
      case "BUG_CRITICAL":
        return { label: "Critical Bug", bg: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
      case "SHOWING_ENHANCEMENT":
        return { label: "UX Enhancement", bg: "bg-[#FF6C22]/10 text-[#FF6C22] border-[#FF6C22]/20" };
      case "CLIENT_CUSTOM_REQ":
        return { label: "Custom Request", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    }
  };

  const getSeverityBadge = (sev: FeedbackSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return "text-rose-500 font-bold";
      case "HIGH":
        return "text-amber-500 font-semibold";
      case "MEDIUM":
        return "text-sky-500 font-medium";
      case "LOW":
        return "text-gray-400 font-normal";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#18191E] border border-white/10 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#FF6C22]" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#18191E] tracking-tight">Showing Sessions & Live Feedback Tracker</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF6C22]/10 text-[#FF6C22] border border-[#FF6C22]/20">
              Live Demo Radar
            </span>
          </div>
          <p className="text-xs text-[#25272D]/60 mt-1">
            Conduct zero-leak live client walkthroughs, capture real-time client feedback, and convert them to Kanban QA tickets in 1-click.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSessions}
            title="Refresh Sessions"
            className="p-2 rounded-xl border border-black/10 hover:bg-black/5 text-[#25272D]/60 hover:text-[#18191E] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF6C22]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#FF6C22]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Showing Session</span>
          </button>
        </div>
      </div>

      {/* 2. Showing Mode Anti-Leak Banner */}
      {isShowing && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-amber-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-medium">
              <strong>Showing Mode Active:</strong> All enterprise client names are masked with Showing Aliases (e.g. <em>{sessions[0]?.clientShowingAlias || "Client-A"}</em>) during live demonstration.
            </span>
          </div>
          <kbd className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-mono text-[10px] font-bold">
            Ctrl+Shift+S
          </kbd>
        </div>
      )}

      {/* 3. Hero Card: Active Session or Quick Start */}
      {selectedSession && (
        <div className="bg-[#18191E] border border-white/10 rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            selectedSession.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-[#FF6C22]"
          }`} />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Session Meta Info */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  selectedSession.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse"
                    : selectedSession.status === "SCHEDULED"
                    ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                    : "bg-white/10 text-white/50 border-white/10"
                }`}>
                  {selectedSession.status === "ACTIVE" ? "● LIVE DEMO IN PROGRESS" : selectedSession.status}
                </span>

                <span className="text-xs text-white/40">·</span>
                <span className="text-xs text-white/60 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6C22]" />
                  {new Date(selectedSession.scheduledAt).toLocaleString()}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {selectedSession.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">
                    {selectedSession.clientCode}
                  </span>
                  <span className="font-semibold text-white/90">
                    {isShowing && selectedSession.clientShowingAlias ? selectedSession.clientShowingAlias : selectedSession.clientName}
                  </span>
                  <span>·</span>
                  <span>Conducted by: <strong>{selectedSession.conductedByName || "Rey Cannavaro"}</strong></span>
                </div>
              </div>

              {selectedSession.notes && (
                <p className="text-xs text-white/50 bg-black/30 p-3 rounded-2xl border border-white/5 leading-relaxed">
                  {selectedSession.notes}
                </p>
              )}

              {/* Status Actions */}
              <div className="flex items-center gap-2 pt-1">
                {selectedSession.status === "SCHEDULED" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedSession.id, "ACTIVE")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Live Demo</span>
                  </button>
                )}

                {selectedSession.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedSession.id, "COMPLETED")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Demo Completed</span>
                  </button>
                )}

                <span className="text-xs text-white/40 ml-2">
                  Total Feedbacks Captured: <strong>{feedbacks.length}</strong> ({feedbacks.filter(f => f.status === "CONVERTED_TO_TASK").length} converted to tasks)
                </span>
              </div>
            </div>

            {/* Right: Real-Time Quick Feedback Logger Form */}
            <div className="bg-[#06080D] border border-white/10 rounded-2xl p-4 lg:w-[420px] shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF6C22]" />
                  <span>Quick Log Client Feedback</span>
                </span>
                <span className="text-[10px] text-white/40 font-mono">REALTIME CAPTURE</span>
              </div>

              <form onSubmit={handleLogFeedback} className="space-y-2.5">
                {/* Category & Severity Selectors */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as FeedbackCategory)}
                    className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF6C22]"
                  >
                    <option value="SHOWING_ENHANCEMENT">UX Enhancement</option>
                    <option value="BUG_CRITICAL">Critical Bug</option>
                    <option value="CLIENT_CUSTOM_REQ">Custom Request</option>
                  </select>

                  <select
                    value={quickSeverity}
                    onChange={(e) => setQuickSeverity(e.target.value as FeedbackSeverity)}
                    className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF6C22]"
                  >
                    <option value="LOW">Low Severity</option>
                    <option value="MEDIUM">Medium Severity</option>
                    <option value="HIGH">High Severity</option>
                    <option value="CRITICAL">Critical Severity</option>
                  </select>
                </div>

                {/* Textarea */}
                <textarea
                  rows={2}
                  required
                  placeholder="What did the client say or request? e.g. 'Shift 3 overtime multiplier needs 2.5x instead of 2.0x'..."
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6C22] resize-none"
                />

                <button
                  type="submit"
                  disabled={isLoggingFeedback || !quickDescription.trim()}
                  className="w-full py-2 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isLoggingFeedback ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Log Feedback Instant</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Split View: Sessions Directory (Left) & Feedbacks Stream with 1-Click Convert (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sessions Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-black/5 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#18191E] uppercase tracking-wider">
              Showing Sessions ({filteredSessions.length})
            </span>
            <div className="flex items-center gap-1 bg-black/[0.04] p-1 rounded-xl text-[10px] font-semibold">
              {["ALL", "ACTIVE", "SCHEDULED", "COMPLETED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    statusFilter === st
                      ? "bg-white text-[#18191E] shadow-xs"
                      : "text-[#25272D]/50 hover:text-[#18191E]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredSessions.length === 0 ? (
              <p className="text-xs text-[#25272D]/40 text-center py-8">No sessions found.</p>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSessionId === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#18191E] border-transparent text-white shadow-md scale-[1.01]"
                        : "bg-white hover:bg-black/[0.02] border-black/5 text-[#18191E]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSelected ? "bg-white/10 text-white" : "bg-black/5 text-[#25272D]/70"
                        }`}>
                          {session.clientCode}
                        </span>
                        <span className={`font-semibold truncate max-w-[150px] ${isSelected ? "text-white" : "text-[#18191E]"}`}>
                          {isShowing && session.clientShowingAlias ? session.clientShowingAlias : session.clientName}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        session.status === "ACTIVE"
                          ? "bg-emerald-500 text-white animate-pulse"
                          : session.status === "SCHEDULED"
                          ? "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                          : "bg-black/5 text-[#25272D]/50"
                      }`}>
                        {session.status}
                      </span>
                    </div>

                    <p className={`text-xs font-medium line-clamp-1 ${isSelected ? "text-white/90" : "text-[#18191E]"}`}>
                      {session.title}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 text-[11px]">
                      <span className={isSelected ? "text-white/50" : "text-[#25272D]/40"}>
                        {new Date(session.scheduledAt).toLocaleDateString()} · {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`font-semibold ${isSelected ? "text-[#FF6C22]" : "text-[#FF6C22]"}`}>
                        {session.feedbacksCount || 0} feedbacks
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Live Feedbacks Stream & 1-Click Convert to Task (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-black/5 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div>
              <h2 className="text-xs font-bold text-[#18191E] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF6C22]" />
                <span>Captured Feedbacks ({feedbacks.length})</span>
              </h2>
              <p className="text-[11px] text-[#25272D]/50 mt-0.5">
                Session: <strong>{selectedSession?.title || "No session selected"}</strong>
              </p>
            </div>

            {feedbacks.some(f => f.status === "CONVERTED_TO_TASK") && onNavigateToTasks && (
              <button
                type="button"
                onClick={onNavigateToTasks}
                className="text-xs font-bold text-[#FF6C22] hover:underline flex items-center gap-1"
              >
                <span>View Kanban Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Feedback Stream List */}
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {isFeedbacksLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#FF6C22] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MessageSquare className="w-8 h-8 text-[#25272D]/20 mx-auto" />
                <p className="text-xs font-semibold text-[#18191E]">No feedbacks recorded for this session yet</p>
                <p className="text-[11px] text-[#25272D]/40">
                  Use the quick form above during client demo to capture feedback in real time.
                </p>
              </div>
            ) : (
              feedbacks.map((fb) => {
                const categoryBadge = getCategoryBadge(fb.category);
                const isConverted = fb.status === "CONVERTED_TO_TASK";
                const isConverting = convertingId === fb.id;

                return (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl border border-black/5 bg-black/[0.015] hover:bg-black/[0.03] transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadge.bg}`}>
                          {categoryBadge.label}
                        </span>
                        <span className={`text-[10px] ${getSeverityBadge(fb.severity)}`}>
                          ● {fb.severity} SEVERITY
                        </span>
                      </div>

                      <span className="text-[10px] text-[#25272D]/40 font-mono">
                        {new Date(fb.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#18191E] font-medium leading-relaxed">
                      {fb.description}
                    </p>

                    {/* Bottom Action: 1-Click Convert to Task Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5">
                      <div className="flex items-center gap-1.5">
                        {isConverted ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Converted to Kanban Task</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#25272D]/50 font-mono">
                            Status: Logged
                          </span>
                        )}
                      </div>

                      {!isConverted && (
                        <button
                          type="button"
                          onClick={() => handleConvertToTask(fb)}
                          disabled={isConverting}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                          {isConverting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>Convert to Task</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadSessions();
          showToast("New Showing Session created!");
        }}
        isShowing={isShowing}
      />
    </div>
  );
}
