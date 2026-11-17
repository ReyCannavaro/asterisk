import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { KanbanBoard } from "./KanbanBoard";
import { ClientsManager } from "./ClientsManager";
import { VaultManager } from "./VaultManager";
import { ShowingManager } from "./ShowingManager";
import { RolesAuditManager } from "./RolesAuditManager";
import { CreateClientModal } from "./CreateClientModal";
import { useShowingMode } from "../lib/showing-store";
import { api } from "../lib/eden";
import type { SidebarConfig } from "@asterisk/types";

export function Dashboard() {
  const { isShowing, toggle } = useShowingMode();
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig | undefined>(undefined);
  const [activeView, setActiveView] = useState<string>("overview");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isQuickCreateClientOpen, setIsQuickCreateClientOpen] = useState(false);

  const loadNavigation = async () => {
    try {
      const response = await api.api.me.navigation.get({
        headers: {
          "x-asterisk-showing-mode": String(isShowing),
        },
      });

      if (response.data) {
        setSidebarConfig(response.data as SidebarConfig);
      }
    } catch (error) {
      console.warn("[Asterisk] Navigation API request fallback to local defaults:", error);
    }
  };

  useEffect(() => {
    loadNavigation();
  }, [isShowing]);

  const handleSelectView = (viewId: string) => {
    setActiveView(viewId);
    if (viewId !== "clients") {
      setSelectedClientId(null);
    }
  };

  const handleSelectClientFromSidebar = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveView("clients");
  };

  return (
    <div className="bg-white rounded-[32px] w-full max-w-[1480px] shadow-2xl p-5 flex gap-6 overflow-hidden min-h-[920px]">
      {/* Swiss Pod Sidebar with Dynamic Navigation & Showing Mask */}
      <Sidebar 
        config={sidebarConfig} 
        isShowing={isShowing} 
        activeView={activeView}
        onSelectView={handleSelectView}
        onSelectClient={handleSelectClientFromSidebar}
        onOpenCreateClient={() => setIsQuickCreateClientOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 min-w-0 flex flex-col justify-start">
        <Header isShowing={isShowing} onToggleShowing={toggle} />

        <div className="flex-1 overflow-x-auto pb-4">
          {activeView === "clients" ? (
            <ClientsManager
              isShowing={isShowing}
              initialSelectedClientId={selectedClientId}
              onSelectClient={(cId) => setSelectedClientId(cId)}
            />
          ) : activeView === "vault" ? (
            <VaultManager isShowing={isShowing} />
          ) : activeView === "showing" ? (
            <ShowingManager
              isShowing={isShowing}
              onNavigateToTasks={() => setActiveView("tasks")}
            />
          ) : activeView === "roles" || activeView === "audit" ? (
            <RolesAuditManager
              isShowing={isShowing}
              initialTab={activeView === "audit" ? "audit" : "roles"}
            />
          ) : (
            <KanbanBoard isShowing={isShowing} />
          )}
        </div>
      </main>

      {/* Quick Add Client Modal from Sidebar (+) button */}
      <CreateClientModal
        isOpen={isQuickCreateClientOpen}
        onClose={() => setIsQuickCreateClientOpen(false)}
        onSuccess={() => {
          loadNavigation();
          setActiveView("clients");
        }}
        isShowing={isShowing}
      />
    </div>
  );
}
