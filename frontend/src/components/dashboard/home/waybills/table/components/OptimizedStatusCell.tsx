import React from "react";
import type { WaybillStatus } from "@/types/waybill";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";

interface OptimizedStatusCellProps {
  status: WaybillStatus;
}

export const OptimizedStatusCell = React.memo<OptimizedStatusCellProps>(
  ({ status }) => {
    const info = STATUS_MAP[status] || { text: status, color: "gray" };
    return (
      <div className="flex items-center">
        <StatusBadge color={info.color}>{info.text}</StatusBadge>
      </div>
    );
  }
);

OptimizedStatusCell.displayName = "OptimizedStatusCell";
