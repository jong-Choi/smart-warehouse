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
  SidebarTrigger,
} from "@components/ui/sidebar";

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // 사이드바가 닫혀있을 때 NavLink 이동 막고 사이드바만 열리게 하는 함수
  const handleSidebarExpand: React.MouseEventHandler<HTMLAnchorElement> = (
    e
  ) => {
    const sidebarWrapper = document.querySelector(
      '[data-slot="sidebar-wrapper"]'
    );
    if (sidebarWrapper) {
      const sidebar = sidebarWrapper.querySelector('[data-slot="sidebar"]');
      if (sidebar && sidebar.getAttribute("data-collapsible") === "icon") {
        // 사이드바가 collapsed 상태일 때만 expanded로 변경
        e.preventDefault();
        const event = new CustomEvent("sidebar-toggle", {
          detail: { expand: true },
        });
        window.dispatchEvent(event);
      }
    }
  };

  const renderMenuItem = (item: NavigationItem) => {
    if (item.children) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            variant="ghost"
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
              <div key={child.title} className="list-none">
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
              </div>
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
      <SidebarHeader className="flex items-center justify-between overflow-hidden border-b bg-sidebar-accent/30">
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="창고 보기" asChild>
              <NavLink
                to="/warehouse"
                onClick={handleSidebarExpand}
                className="flex items-center gap-2"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg shadow-sm">
                  <Package className="size-5" />
                </div>
                <div className="flex flex-col leading-tight flex-1 items-center ">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-gray-900">
                      <div className="flex flex-col leading-tight -translate-y-0.5">
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
                  {/* <span className="text-lg font-black tracking-tight text-primary">
                    S
                    <span className="inline-block -scale-y-100 translate-y-0.5">
                      w
                    </span>
                    <span className="text-xl inline-block -scale-y-100 translate-y-0.5">
                      v
                    </span>
                    rt
                  </span> */}
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground -translate-y-2 -translate-x-0.5">
                    Warehouse
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarTrigger className="flex-shrink-0 text-muted-foreground -mt-5" />
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
