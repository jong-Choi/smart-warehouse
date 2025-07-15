import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Package,
  MapPin,
  Settings,
  BarChart3,
  Truck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../ui/sidebar";

const navigationData = [
  {
    title: "대시보드",
    url: "/dashboard/home",
    icon: Home,
  },
  {
    title: "소포 관리",
    url: "/dashboard/parcels",
    icon: Package,
  },
  {
    title: "위치 관리",
    url: "/dashboard/location",
    icon: MapPin,
  },
  {
    title: "운송 관리",
    url: "/dashboard/transport",
    icon: Truck,
  },
  {
    title: "통계",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "설정",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="물류 관리 시스템" asChild>
              <NavLink to="/dashboard/home">
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
            {navigationData.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className="group"
                >
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="font-medium">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
