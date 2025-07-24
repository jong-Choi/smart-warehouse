import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@components/dashboard/layout/DashboardSidebar";
import { ChatbotPanel } from "@components/dashboard/chatbot/ChatbotPanel";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTriggerAsChild,
} from "@components/ui/sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(true);

  const calcWidth = isOpen
    ? "lg:max-w-[calc(100vw-20rem)]"
    : "lg:max-w-[calc(100vw-6rem)]";

  return (
    <div className="h-full">
      <SidebarProvider
        open={isOpen}
        onOpenChange={setIsOpen}
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
            <SidebarTriggerAsChild
              onClick={() => setIsOpen(!isOpen)}
              className="block md:hidden"
            >
              <Menu className="w-6 h-6" />
            </SidebarTriggerAsChild>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                <div className="flex flex-col leading-tight">
                  <span className="text-2xl font-black tracking-tight text-primary">
                    S
                    <span className="inline-block -scale-y-100 translate-y-1">
                      w
                    </span>
                    <span className="text-3xl inline-block -scale-y-100 translate-y-1">
                      v
                    </span>
                    rt
                  </span>
                </div>
              </h1>
            </div>
            <div className="text-sm font-medium text-muted-foreground tracking-wide translate-y-0.5">
              AI-Powered Smart Warehouse
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div
              className={cn(
                "flex h-full",
                calcWidth,
                "transition-[max-width] duration-300"
              )}
            >
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
