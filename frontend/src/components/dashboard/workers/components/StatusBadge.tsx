import React from "react";
import { Badge } from "@/ui/badge";
import type { WorkerStatus } from "@/components/dashboard/workers/types";

interface StatusBadgeProps {
  status: WorkerStatus;
  workStartedAt?: string;
}

/**
 * 작업자 상태를 표시하는 배지 컴포넌트
 */
export const StatusBadge = React.memo<StatusBadgeProps>(
  ({ status, workStartedAt }) => {
    // 작업 시작 시간이 없으면 "-" 반환
    if (!workStartedAt) return <span>-</span>;

    switch (status) {
      case "WORKING":
        return (
          <Badge variant="default" className="bg-green-500">
            작업중
          </Badge>
        );
      case "IDLE":
        return <Badge variant="secondary">대기중</Badge>;
      case "BROKEN":
        return <Badge variant="destructive">사고</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  }
);

StatusBadge.displayName = "StatusBadge";
