import React, { useCallback } from "react";
import { TableCell, TableRow } from "../../../ui/table";
import { StatusCell } from "./StatusCell";
import type { UnloadingParcel } from "@components/dashboard/unloading/types";

interface ParcelRowProps {
  parcel: UnloadingParcel;
}

// 운송장 행을 별도 컴포넌트로 분리
export const ParcelRow = React.memo<ParcelRowProps>(({ parcel }) => {
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  }, []);

  return (
    <TableRow key={parcel.id}>
      <TableCell className="font-medium">{parcel.waybillId}</TableCell>
      <TableCell>
        <StatusCell status={parcel.status} />
      </TableCell>
      <TableCell>{formatDate(parcel.createdAt)}</TableCell>
      <TableCell>{formatDate(parcel.updatedAt)}</TableCell>
    </TableRow>
  );
});

ParcelRow.displayName = "ParcelRow";
