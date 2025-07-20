import { NavLink } from "react-router-dom";
import { Package } from "lucide-react";
import { navigationData, type NavigationItem } from "@utils/navigationData";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const renderMenuItem = (item: NavigationItem) => {
    if (item.children) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            className="group cursor-default hover:bg-transparent !hover:bg-transparent"
            onClick={() => {
              // 아이콘 클릭 시 사이드바 expanded 상태로 변경
              const sidebarWrapper = document.querySelector(
                '[data-slot="sidebar-wrapper"]'
              );
              if (sidebarWrapper) {
                const sidebar = sidebarWrapper.querySelector(
                  '[data-slot="sidebar"]'
                );
                if (
                  sidebar &&
                  sidebar.getAttribute("data-collapsible") === "icon"
                ) {
                  // 사이드바가 collapsed 상태일 때만 expanded로 변경
                  const event = new CustomEvent("sidebar-toggle", {
                    detail: { expand: true },
                  });
                  window.dispatchEvent(event);
                }
              }
            }}
          >
            {item.icon && (
              <item.icon className="h-5 w-5 transition-transform duration-200" />
            )}
            <span className="font-medium">{item.title}</span>
          </SidebarMenuButton>
          <div className="ml-4 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
            {item.children.map((child: NavigationItem) => (
              <SidebarMenuItem key={child.title}>
                <NavLink
                  to={child.url || "#"}
                  className="w-full"
                  end={
                    child.title === "전체보기" || child.title === "매출 개요"
                  }
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <SidebarMenuButton
                      tooltip={child.title}
                      isActive={isActive}
                      variant="submenu"
                      className="group w-full cursor-pointer"
                    >
                      <span className="font-medium text-sm">{child.title}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </div>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton tooltip={item.title} asChild className="group">
          <NavLink
            to={item.url || "#"}
            className={({ isActive }) =>
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : ""
            }
          >
            {item.icon && (
              <item.icon className="h-5 w-5 transition-transform duration-200 " />
            )}
            <span className="font-medium">{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="물류 관리 시스템" asChild>
              <NavLink to="/dashboard/realtime/overview">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg shadow-sm">
                  <Package className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">물류 관리 시스템</span>
                  <span className="text-xs opacity-70">Dashboard</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navigationData.map(renderMenuItem)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
