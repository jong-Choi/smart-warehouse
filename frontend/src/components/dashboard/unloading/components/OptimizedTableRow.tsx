import React from "react";
import { TableCell, TableRow } from "@ui/table";
import { OptimizedStatusCell } from "@/components/dashboard/unloading/components/OptimizedStatusCell";
import { OptimizedDateCell } from "@/components/dashboard/unloading/components/OptimizedDateCell";
import type { UnloadingParcel } from "@/components/dashboard/unloading/types";

// 금액 포맷팅 유틸리티 함수
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface OptimizedTableRowProps {
  parcel: UnloadingParcel;
  isSelected?: boolean;
}

// 최적화된 테이블 행 컴포넌트
export const OptimizedTableRow = React.memo<OptimizedTableRowProps>(
  ({ parcel, isSelected }) => {
    return (
      <TableRow data-state={isSelected && "selected"}>
        <TableCell>
          <div className="font-medium">{parcel.waybillId}</div>
        </TableCell>
        <TableCell>
          <OptimizedStatusCell status={parcel.status} />
        </TableCell>
        <TableCell>
          <OptimizedDateCell date={parcel.createdAt} />
        </TableCell>
        <TableCell>
          <OptimizedDateCell date={parcel.unloadedAt || ""} />
        </TableCell>
        <TableCell>
          <OptimizedDateCell date={parcel.workerProcessedAt || ""} />
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {parcel.processedBy || "-"}
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium text-right">
            {formatCurrency(parcel.declaredValue)}
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

OptimizedTableRow.displayName = "OptimizedTableRow";
