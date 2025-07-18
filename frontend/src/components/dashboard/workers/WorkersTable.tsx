import React, { useMemo } from "react";
import { Badge } from "@/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { useWorkersStore } from "@/stores/workersStore";
import type { WorkerStatus, Worker, WorkerStats } from "./types";

// 상태 배지 컴포넌트를 메모이제이션
const StatusBadge = React.memo<{
  status: WorkerStatus;
  workStartedAt?: string;
}>(({ status, workStartedAt }) => {
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
});

StatusBadge.displayName = "StatusBadge";

// 시간 포맷팅 함수들을 메모이제이션
const formatTime = (timeString?: string) => {
  if (!timeString) return "-";
  return new Date(timeString).toLocaleTimeString();
};

const formatWorkTime = (milliseconds: number) => {
  if (milliseconds === 0) return "-";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  } else {
    return `${seconds}초`;
  }
};

const calculateUtilization = (
  totalWorkTime: number,
  workStartedAt?: string
) => {
  if (!workStartedAt || totalWorkTime === 0) return "-";

  const now = new Date().getTime();
  const startTime = new Date(workStartedAt).getTime();
  const totalTime = now - startTime;

  if (totalTime <= 0) return "-";

  const utilization = (totalWorkTime / totalTime) * 100;
  return `${utilization.toFixed(1)}%`;
};

const calculateAccidentRate = (
  processedCount: number,
  accidentCount: number
) => {
  const totalCount = processedCount + accidentCount;
  if (totalCount === 0) return "-";

  const accidentRate = (accidentCount / totalCount) * 100;
  return `${accidentRate.toFixed(1)}%`;
};

// 개별 테이블 행 컴포넌트를 메모이제이션
const WorkerTableRow = React.memo<{ worker: Worker }>(({ worker }) => {
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
      <TableCell className="font-medium">{worker.id}</TableCell>
      <TableCell>{worker.name}</TableCell>
      <TableCell>
        <StatusBadge
          status={worker.status}
          workStartedAt={worker.workStartedAt}
        />
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

// 통계 카드 컴포넌트를 메모이제이션
const StatsCard = React.memo<{
  title: string;
  value: number;
  color?: string;
}>(({ title, value, color = "" }) => (
  <div className="bg-white rounded-lg border p-4">
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="text-sm font-medium">{title}</div>
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
));

StatsCard.displayName = "StatsCard";

// 통계 섹션 컴포넌트를 메모이제이션
const StatsSection = React.memo<{ stats: WorkerStats }>(({ stats }) => (
  <div className="grid grid-cols-4 gap-4">
    <StatsCard title="전체 작업자" value={stats.totalWorkers} />
    <StatsCard
      title="작업중"
      value={stats.workingWorkers}
      color="text-green-600"
    />
    <StatsCard title="대기중" value={stats.idleWorkers} color="text-gray-600" />
    <StatsCard title="고장" value={stats.brokenWorkers} color="text-red-600" />
  </div>
));

StatsSection.displayName = "StatsSection";

export const WorkersTable: React.FC = () => {
  const { workers, stats } = useWorkersStore();

  // 통계 데이터를 메모이제이션
  const memoizedStats = useMemo(() => stats, [stats]);

  // 작업자 목록을 메모이제이션
  const memoizedWorkers = useMemo(() => workers, [workers]);

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <StatsSection stats={memoizedStats} />

      {/* 작업자 테이블 */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="text-lg font-semibold">작업자 관리</div>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>작업자 ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>정상 건수</TableHead>
                <TableHead>파손 건수</TableHead>
                <TableHead>사고율</TableHead>
                <TableHead>작업 시작</TableHead>
                <TableHead>처리시간</TableHead>
                <TableHead>가동률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memoizedWorkers.map((worker) => (
                <WorkerTableRow key={worker.id} worker={worker} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
