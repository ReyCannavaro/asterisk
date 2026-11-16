import React from "react";
import { 
  LayoutList, 
  LayoutGrid, 
  GitFork, 
  Plus, 
  Zap, 
  Share2, 
  Search, 
  SlidersHorizontal, 
  Filter, 
  User as UserIcon, 
  Eye,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

interface HeaderProps {
  isShowing: boolean;
  onToggleShowing: () => void;
}

export function Header({ isShowing, onToggleShowing }: HeaderProps) {
  return (
    <header className="mb-6 space-y-4">
      {/* Top Action Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Publications</h1>

          {/* Segmented View Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 transition">
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#18191E] text-white shadow-sm transition">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 transition">
              <GitFork className="w-3.5 h-3.5" />
              <span>Workflow</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FF6C22] text-white shadow-sm hover:bg-[#FF7A29] transition">
              <Plus className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Showing Mode Toggle Button */}
          <button 
            onClick={onToggleShowing}
            title="Hotkey: Ctrl + Shift + S"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${
              isShowing 
                ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm animate-pulse" 
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isShowing ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SHOWING ACTIVE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-gray-400" />
                <span>Showing Mode (Off)</span>
              </>
            )}
            <kbd className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">Ctrl+Shift+S</kbd>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <Zap className="w-3.5 h-3.5 text-gray-500" />
            <span>Automate</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <Share2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort by</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Me</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition">
            <Eye className="w-3.5 h-3.5" />
            <span>Show</span>
          </button>
        </div>
      </div>
    </header>
  );
}
