import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { KanbanBoard } from "./KanbanBoard";
import { useShowingMode } from "../lib/showing-store";
import { api } from "../lib/eden";
import type { SidebarConfig } from "@asterisk/types";

export function Dashboard() {
  const { isShowing, toggle } = useShowingMode();
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function loadNavigation() {
      try {
        const response = await api.api.me.navigation.get({
          headers: {
            "x-asterisk-showing-mode": String(isShowing),
          },
        });

        if (isMounted && response.data) {
          setSidebarConfig(response.data as SidebarConfig);
        }
      } catch (error) {
        console.warn("[Asterisk] Navigation API request fallback to local defaults:", error);
      }
    }

    loadNavigation();

    return () => {
      isMounted = false;
    };
  }, [isShowing]);

  return (
    <div className="bg-white rounded-[32px] w-full max-w-[1480px] shadow-2xl p-5 flex gap-6 overflow-hidden min-h-[920px]">
      {/* Swiss Pod Sidebar with Dynamic Navigation & Showing Mask */}
      <Sidebar config={sidebarConfig} isShowing={isShowing} />

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
