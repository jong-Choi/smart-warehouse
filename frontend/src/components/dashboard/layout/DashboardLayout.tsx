import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@components/dashboard/layout/DashboardSidebar";
import { ChatbotPanel } from "@components/dashboard/chatbot/ChatbotPanel";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@components/ui/sidebar";
import { Separator } from "@components/ui/separator";

function DashboardLayout() {
  return (
    <div className="h-full">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "18rem",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar />
        <SidebarInset className="flex flex-col h-full">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                스마트 창고
              </h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex h-full">
              <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-col gap-4 p-4">
                  <Outlet />
                </div>
              </div>
              <ChatbotPanel />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default DashboardLayout;
