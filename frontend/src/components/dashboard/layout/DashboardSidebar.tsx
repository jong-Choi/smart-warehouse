import { NavLink } from "react-router-dom";
import {
  Activity,
  Package,
  MapPin,
  Settings,
  BarChart3,
  Truck,
  Users,
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
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const navigationData: NavigationItem[] = [
  {
    title: "실시간 현황",
    icon: Activity,
    children: [
      {
        title: "개요",
        url: "/dashboard/realtime/overview",
      },

      {
        title: "운송장 현황",
        url: "/dashboard/realtime/waybill",
      },
      {
        title: "작업자 현황",
        url: "/dashboard/realtime/workers",
        icon: Users,
      },
    ],
  },
  {
    title: "소포 관리",
    icon: Package,
    children: [
      {
        title: "전체보기",
        url: "/dashboard/parcels",
      },
      {
        title: "소포목록",
        url: "/dashboard/parcels/list",
      },
      {
        title: "입고 관리",
        url: "/dashboard/parcels/inbound",
      },
      {
        title: "출고 관리",
        url: "/dashboard/parcels/outbound",
      },
    ],
  },
  {
    title: "위치 관리",
    icon: MapPin,
    children: [
      {
        title: "전체보기",
        url: "/dashboard/location",
      },
      {
        title: "위치목록",
        url: "/dashboard/location/list",
      },
    ],
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
  const renderMenuItem = (item: NavigationItem) => {
    if (item.children) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton tooltip={item.title} className="group">
            {item.icon && (
              <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            )}
            <span className="font-medium">{item.title}</span>
          </SidebarMenuButton>
          <div className="ml-4 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
            {item.children.map((child: NavigationItem) => (
              <SidebarMenuItem key={child.title}>
                <NavLink
                  to={child.url || "#"}
                  className="w-full"
                  end={child.title === "전체보기"}
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <SidebarMenuButton
                      tooltip={child.title}
                      isActive={isActive}
                      className="group w-full"
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
                : "hover:bg-sidebar-accent/50"
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
