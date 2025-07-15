import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../ui/sidebar";
import { Separator } from "../../ui/separator";

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
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                물류 관리 시스템
              </h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default DashboardLayout;
