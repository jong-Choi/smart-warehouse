import React from "react";
import { TableCell, TableRow } from "../../../../ui/table";
import { OptimizedStatusCell } from "./OptimizedStatusCell";
import { OptimizedDateCell } from "./OptimizedDateCell";
import type { UnloadingParcel } from "../types";

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
          <OptimizedDateCell date={parcel.updatedAt} />
        </TableCell>
      </TableRow>
    );
  }
);

OptimizedTableRow.displayName = "OptimizedTableRow";
