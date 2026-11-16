import React from "react";
import { 
  Home, 
  Activity, 
  CheckSquare, 
  MessageSquare, 
  Settings, 
  Plus, 
  Folder 
} from "lucide-react";

export function Sidebar() {
  const members = [
    { name: "Zaid Myers", time: "08:06:28 for this week", color: "bg-blue-500", initials: "ZM" },
    { name: "Rebecca Young", time: "12:41:07 for this week", color: "bg-pink-500", initials: "RY" },
    { name: "Isaac Bowman", time: "01:56:22 for this week", color: "bg-emerald-500", initials: "IB" },
    { name: "Vanessa Douglas", time: "16:35:59 for this week", color: "bg-purple-500", initials: "VD" },
  ];

  return (
    <aside className="w-[248px] bg-[#18191E] text-white rounded-[24px] p-5 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 relative flex items-center justify-center">
            {/* Swiss Monolith Asterisk Icon */}
            <div className="w-6 h-6 relative flex items-center justify-center">
              <span className="text-[#FF6C22] text-2xl font-black leading-none select-none">*</span>
              <div className="w-1.5 h-1.5 bg-white rounded-full absolute" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight">Asterisk</span>
        </div>

        {/* Menu Section */}
        <div className="mb-6">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-3">
            Menu
          </span>
          <nav className="space-y-1">
            <a href="#overview" className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#25272F] text-white text-sm font-medium transition">
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-white" />
                <span>Overview</span>
              </div>
              <span className="bg-[#FF6C22] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">12</span>
            </a>

            <a href="#activity" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-200 text-sm font-normal transition">
              <Activity className="w-4 h-4" />
              <span>Activity</span>
            </a>

            <a href="#tasks" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-200 text-sm font-normal transition">
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </a>

            <a href="#chat" className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-400 hover:text-gray-200 text-sm font-normal transition">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </div>
              <span className="bg-[#FF6C22] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">1</span>
            </a>

            <a href="#settings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-200 text-sm font-normal transition">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
            <button className="text-gray-400 hover:text-white transition">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-white text-sm font-medium">
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4 text-[#FF6C22]" />
                <span>Publications</span>
              </div>
              <span className="bg-[#FF6C22] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">4</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-400 text-sm">
              <Folder className="w-4 h-4 text-gray-500" />
              <span>Planning</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-400 text-sm">
              <Folder className="w-4 h-4 text-gray-500" />
              <span>Design Internal</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-400 text-sm">
              <Folder className="w-4 h-4 text-gray-500" />
              <span>Marketing</span>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Members</span>
            <button className="text-gray-400 hover:text-white transition">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {members.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 px-1">
                <div className={`w-7 h-7 rounded-full ${m.color} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                  {m.initials}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-gray-200 truncate">{m.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned Bottom User Card */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
            KM
          </div>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#18191E] absolute -bottom-0.5 -right-0.5" />
        </div>
        <div className="truncate">
          <div className="text-xs font-semibold text-white">Katrina Malone</div>
          <div className="text-[10px] text-gray-400">Product Designer</div>
        </div>
      </div>
    </aside>
  );
}
