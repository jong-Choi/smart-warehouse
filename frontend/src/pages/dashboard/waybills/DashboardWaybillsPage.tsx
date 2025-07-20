import { useState } from "react";
import DashboardWaybillsListPage from "@pages/dashboard/waybills/DashboardWaybillsListPage";
import DashboardWaybillDetailPage from "@pages/dashboard/waybills/DashboardWaybillDetailPage";
import type { Waybill } from "@/types";

export default function DashboardWaybillsPage() {
  const [selectedWaybill, setSelectedWaybill] = useState<Waybill | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  const handleWaybillSelect = (waybill: Waybill) => {
    setSelectedWaybill(waybill);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setSelectedWaybill(null);
    setViewMode("list");
  };

  if (viewMode === "detail" && selectedWaybill) {
    return (
      <DashboardWaybillDetailPage
        waybill={selectedWaybill}
        onBack={handleBackToList}
      />
    );
  }

  return <DashboardWaybillsListPage onWaybillSelect={handleWaybillSelect} />;
}
