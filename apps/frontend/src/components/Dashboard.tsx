import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { KanbanBoard } from "./KanbanBoard";
import { useShowingMode } from "../lib/showing-store";

export function Dashboard() {
  const { isShowing, toggle } = useShowingMode();

  return (
    <div className="bg-white rounded-[32px] w-full max-w-[1480px] shadow-2xl p-5 flex gap-6 overflow-hidden min-h-[920px]">
      {/* Swiss Pod Sidebar with Dynamic Navigation & Showing Mask */}
      <Sidebar isShowing={isShowing} />

      {/* Main Workspace Area */}
      <main className="flex-1 min-w-0 flex flex-col justify-start">
        <Header isShowing={isShowing} onToggleShowing={toggle} />
        <div className="flex-1 overflow-x-auto pb-4">
          <KanbanBoard isShowing={isShowing} />
        </div>
      </main>
    </div>
  );
}
