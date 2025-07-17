import React, { useCallback } from "react";
import { Badge } from "../../../ui/badge";
import type { ParcelStatus } from "../../../types/waybill";

interface StatusCellProps {
  status: ParcelStatus;
}

// 상태 셀을 별도 컴포넌트로 분리하여 최적화
export const StatusCell = React.memo<StatusCellProps>(({ status }) => {
  const getStatusBadge = useCallback((status: ParcelStatus) => {
    switch (status) {
      case "PENDING_UNLOAD":
        return <Badge variant="secondary">하차 대기</Badge>;
      case "UNLOADED":
        return (
          <Badge variant="default" className="bg-green-500">
            하차 완료
          </Badge>
        );
      case "ACCIDENT":
        return <Badge variant="destructive">파손</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  return <div>{getStatusBadge(status)}</div>;
});

StatusCell.displayName = "StatusCell";
