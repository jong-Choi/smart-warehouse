import React from "react";
import { TableCell, TableRow } from "@ui/table";

import type { UnloadingParcel } from "@components/dashboard/home/waybills/types";
import {
  OptimizedDateCell,
  OptimizedStatusCell,
} from "@components/dashboard/home/waybills/table/components";
import { formatCurrency } from "@utils/formatString";

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
