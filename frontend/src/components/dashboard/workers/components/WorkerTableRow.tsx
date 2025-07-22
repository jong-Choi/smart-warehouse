import React, { useMemo } from "react";
import { TableCell, TableRow } from "@/ui/table";
import {
  formatTime,
  formatWorkTime,
  calculateUtilization,
  calculateAccidentRate,
} from "@/components/dashboard/workers/utils/calculations";
import type { Worker } from "@/components/dashboard/workers/types";
import { Link } from "react-router-dom";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";

interface WorkerTableRowProps {
  worker: Worker;
}

/**
 * 개별 작업자 정보를 표시하는 테이블 행 컴포넌트
 */
export const WorkerTableRow = React.memo<WorkerTableRowProps>(({ worker }) => {
  const formattedWorkStartedAt = useMemo(
    () => formatTime(worker.workStartedAt),
    [worker.workStartedAt]
  );

  const formattedWorkTime = useMemo(
    () => formatWorkTime(worker.totalWorkTime),
    [worker.totalWorkTime]
  );

  const utilization = useMemo(
    () => calculateUtilization(worker.totalWorkTime, worker.workStartedAt),
    [worker.totalWorkTime, worker.workStartedAt]
  );

  const accidentRate = useMemo(
    () => calculateAccidentRate(worker.processedCount, worker.accidentCount),
    [worker.processedCount, worker.accidentCount]
  );

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          to={`/dashboard/workers/${worker.code}`}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          {worker.code}
        </Link>
      </TableCell>
      <TableCell>{worker.name}</TableCell>
      <TableCell>
        <StatusBadge color={STATUS_MAP[worker.status].color}>
          {STATUS_MAP[worker.status].text}
        </StatusBadge>
      </TableCell>
      <TableCell>{worker.processedCount}</TableCell>
      <TableCell>{worker.accidentCount}</TableCell>
      <TableCell>{accidentRate}</TableCell>
      <TableCell>{formattedWorkStartedAt}</TableCell>
      <TableCell>{formattedWorkTime}</TableCell>
      <TableCell>{utilization}</TableCell>
    </TableRow>
  );
});

WorkerTableRow.displayName = "WorkerTableRow";
