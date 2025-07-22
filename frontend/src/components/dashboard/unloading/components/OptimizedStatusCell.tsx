import React from "react";
import type { WaybillStatus } from "@/types/waybill";
import { StatusBadge } from "@/ui/status-badge";

interface OptimizedStatusCellProps {
  status: WaybillStatus;
}

// 상태별 텍스트와 색상 매핑
const statusMap: Record<
  WaybillStatus,
  { text: string; color: "yellow" | "blue" | "green" | "red" | "gray" }
> = {
  PENDING_UNLOAD: { text: "하차 예정", color: "yellow" },
  UNLOADED: { text: "하차 완료", color: "blue" },
  NORMAL: { text: "정상 처리", color: "green" },
  ACCIDENT: { text: "사고", color: "red" },
};

export const OptimizedStatusCell = React.memo<OptimizedStatusCellProps>(
  ({ status }) => {
    const info = statusMap[status] || { text: status, color: "gray" };
    return (
      <div className="flex items-center">
        <StatusBadge color={info.color}>{info.text}</StatusBadge>
      </div>
    );
  }
);

OptimizedStatusCell.displayName = "OptimizedStatusCell";
