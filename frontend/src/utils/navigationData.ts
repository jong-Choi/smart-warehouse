import { Activity, Truck, Users, DollarSign } from "lucide-react";

export interface NavigationItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

export const navigationData: NavigationItem[] = [
  {
    title: "금일 현황",
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
    title: "매출 관리",
    icon: DollarSign,
    children: [
      {
        title: "매출 개요",
        url: "/dashboard/sales/overview",
      },
      {
        title: "월별 매출",
        url: "/dashboard/sales/monthly",
      },
      {
        title: "일별 매출",
        url: "/dashboard/sales/daily",
      },
    ],
  },
  {
    title: "운송장 관리",
    icon: Truck,
    children: [
      {
        title: "운송장 목록",
        url: "/dashboard/waybills",
      },
      {
        title: "지역별 운송장",
        url: "/dashboard/location/waybills",
      },
    ],
  },
  {
    title: "작업자 관리",
    icon: Users,
    children: [
      {
        title: "작업자 목록",
        url: "/dashboard/workers/home",
      },
    ],
  },
];
