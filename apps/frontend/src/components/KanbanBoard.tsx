import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  Zap, 
  Building2, 
  CheckSquare,
  ShieldAlert
} from "lucide-react";
import { api } from "../lib/eden";
import { TaskDetailModal } from "./TaskDetailModal";
import { CreateTaskModal } from "./CreateTaskModal";
import type { TaskStatus, TaskModuleTag } from "@asterisk/types";

interface KanbanProps {
  isShowing: boolean;
}

interface KanbanTaskItem {
  id: string;
  clientId: string;
  feedbackId?: string | null;
  title: string;
  description?: string | null;
  moduleTag: TaskModuleTag;
  status: TaskStatus;
  assignedTo?: string | null;
  assignedToName?: string;
  assignedToAvatar?: string | null;
  dueDate?: string | null;
  positionOrder: number;
  createdAt: string;
  updatedAt: string;
  clientCode?: string;
  clientName?: string;
  clientShowingAlias?: string;
  sourceFeedbackCategory?: string | null;
  sourceFeedbackSeverity?: string | null;
  activitiesCount?: number;
}

const COLUMNS: { id: TaskStatus; label: string; headerColor: string; dotColor: string }[] = [
  { id: "TODO", label: "To Do", headerColor: "text-[#18191E]", dotColor: "bg-gray-400" },
  { id: "IN_PROGRESS", label: "In Progress", headerColor: "text-sky-600", dotColor: "bg-sky-500 animate-pulse" },
  { id: "REVIEW_QA", label: "Review QA", headerColor: "text-amber-600", dotColor: "bg-amber-500" },
  { id: "COMPLETE", label: "Complete", headerColor: "text-emerald-600", dotColor: "bg-emerald-500" },
];

export function KanbanBoard({ isShowing }: KanbanProps) {
  const [tasks, setTasks] = useState<KanbanTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientFilter, setSelectedClientFilter] = useState("ALL");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState("ALL");
  
  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("TODO");

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.api.tasks.get({
        headers: { "x-asterisk-showing-mode": String(isShowing) },
      });

      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data as unknown as KanbanTaskItem[]);
      }
    } catch (err) {
      console.warn("[Asterisk Kanban] Failed to load tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [isShowing]);

  // Instant column move handler with optimistic local state
  const handleMoveStatus = async (task: KanbanTaskItem, targetStatus: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === targetStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: targetStatus } : t))
    );

    try {
      await api.api.tasks({ id: task.id }).status.patch({
        status: targetStatus,
        comment: `Card moved from ${task.status} to ${targetStatus} via Kanban quick-shift`,
      });
    } catch (err: any) {
      console.warn("[Asterisk] Failed to persist task status change:", err);
      loadTasks(); // rollback on error
    }
  };

  const getPreviousStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case "IN_PROGRESS": return "TODO";
      case "REVIEW_QA": return "IN_PROGRESS";
      case "COMPLETE": return "REVIEW_QA";
      default: return null;
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case "TODO": return "IN_PROGRESS";
      case "IN_PROGRESS": return "REVIEW_QA";
      case "REVIEW_QA": return "COMPLETE";
      default: return null;
    }
  };

  const getModuleBadge = (moduleTag: TaskModuleTag) => {
    switch (moduleTag) {
      case "PAYROLL":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "SECURITY":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "ATTENDANCE":
        return "bg-sky-500/10 text-sky-600 border-sky-500/20";
      case "CLAIM":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "DEV":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      default:
        return "bg-[#FF6C22]/10 text-[#FF6C22] border-[#FF6C22]/20";
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.clientName && t.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.clientCode && t.clientCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClient = selectedClientFilter === "ALL" || t.clientId === selectedClientFilter || t.clientCode === selectedClientFilter;
    const matchesModule = selectedModuleFilter === "ALL" || t.moduleTag === selectedModuleFilter;

    return matchesSearch && matchesClient && matchesModule;
  });

  // Unique clients for dropdown
  const uniqueClients = Array.from(
    new Map(
      tasks
        .filter((t) => t.clientId)
        .map((t) => [t.clientId, { id: t.clientId, code: t.clientCode || "", name: isShowing && t.clientShowingAlias ? t.clientShowingAlias : t.clientName || "" }])
    ).values()
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25272D]/40" />
          <input
            type="text"
            placeholder="Search delivery tasks by title or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/[0.03] rounded-xl text-xs text-[#18191E] placeholder:text-[#25272D]/40 focus:outline-none focus:ring-1 focus:ring-[#FF6C22]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Module Filter Pills */}
          <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl text-[11px] font-semibold">
            {["ALL", "PAYROLL", "SECURITY", "ATTENDANCE", "DEV"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedModuleFilter(m)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedModuleFilter === m
                    ? "bg-white text-[#18191E] shadow-xs"
                    : "text-[#25272D]/50 hover:text-[#18191E]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Client Filter */}
          {uniqueClients.length > 0 && (
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-black/[0.03] text-xs font-medium text-[#18191E] rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Clients</option>
              {uniqueClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={loadTasks}
            title="Refresh Kanban"
            className="p-2 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] text-[#25272D]/60 hover:text-[#18191E] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF6C22]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateDefaultStatus("TODO");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6C22] hover:bg-[#FF6C22]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#FF6C22]/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Showing Mode Warning (if active) */}
      {isShowing && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Showing Mode Active:</strong> Client company names on all Kanban cards are masked with aliases.</span>
          </div>
          <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded font-bold">
            Ctrl+Shift+S
          </span>
        </div>
      )}

      {/* 3. The 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start select-none">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="space-y-3 bg-[#F8F9FA]/80 p-3 rounded-2xl border border-black/[0.04] min-h-[520px] flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className={`font-bold text-xs tracking-tight uppercase ${col.headerColor}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono text-[#25272D]/40 font-semibold">
                    ({colTasks.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreateDefaultStatus(col.id);
                    setIsCreateModalOpen(true);
                  }}
                  title={`Add Task to ${col.label}`}
                  className="p-1 rounded-lg hover:bg-black/5 text-[#25272D]/40 hover:text-[#18191E] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="py-12 border border-dashed border-black/10 rounded-2xl text-center p-4 text-[11px] text-[#25272D]/40 space-y-1">
                    <p className="font-medium">No tasks in this stage</p>
                    <p className="text-[10px]">Click + to add backlog ticket</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const prevStatus = getPreviousStatus(task.status);
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white rounded-2xl border border-black/5 p-3.5 shadow-xs hover:shadow-md transition-all space-y-2.5 cursor-pointer group hover:border-[#FF6C22]/30 relative"
                      >
                        {/* Top Badges: Client + Module + Showing Feedback Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/5 text-[#25272D]/70">
                              {task.clientCode || "CLIENT"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getModuleBadge(task.moduleTag)}`}>
                              {task.moduleTag}
                            </span>
                          </div>

                          {task.feedbackId && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#FF6C22]/10 text-[#FF6C22] border border-[#FF6C22]/20 text-[9px] font-bold flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              <span>Showing</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="font-bold text-xs text-[#18191E] leading-snug group-hover:text-[#FF6C22] transition-colors">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-[11px] text-[#25272D]/60 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Card Meta Row: Due Date, Assignee, Activities, & Move Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
                          {/* Left: Date */}
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#25272D]/50">
                            <Calendar className="w-3 h-3 text-[#25272D]/40" />
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Flexible"}</span>
                          </div>

                          {/* Middle: Comments / Activities count */}
                          <div className="flex items-center gap-1 text-[10px] text-[#25272D]/40">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task.activitiesCount || 0}</span>
                          </div>

                          {/* Right: Quick Move Buttons */}
                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                type="button"
                                onClick={(e) => handleMoveStatus(task, prevStatus, e)}
                                title={`Move back to ${prevStatus}`}
                                className="p-1 rounded-md bg-black/[0.03] hover:bg-black/10 text-[#25272D]/50 hover:text-[#18191E] transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}

                            {nextStatus && (
                              <button
                                type="button"
                                onClick={(e) => handleMoveStatus(task, nextStatus, e)}
                                title={`Advance to ${nextStatus}`}
                                className="p-1 rounded-md bg-[#FF6C22]/10 hover:bg-[#FF6C22] text-[#FF6C22] hover:text-white transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadTasks}
        isShowing={isShowing}
        defaultStatus={createDefaultStatus}
      />

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        isShowing={isShowing}
        onTaskUpdated={loadTasks}
      />
    </div>
  );
}
