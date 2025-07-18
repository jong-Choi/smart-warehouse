import React from "react";
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
import type { WorkerStatus } from "./types";

const getStatusBadge = (status: WorkerStatus) => {
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
      return <Badge variant="destructive">고장</Badge>;
    default:
      return <Badge variant="outline">알 수 없음</Badge>;
  }
};

const formatTime = (timeString?: string) => {
  if (!timeString) return "-";
  return new Date(timeString).toLocaleTimeString();
};

export const WorkersTable: React.FC = () => {
  const { workers, stats } = useWorkersStore();

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">전체 작업자</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalWorkers}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">작업중</div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.workingWorkers}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">대기중</div>
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {stats.idleWorkers}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">고장</div>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {stats.brokenWorkers}
          </div>
        </div>
      </div>

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
                <TableHead>처리 건수</TableHead>
                <TableHead>마지막 처리</TableHead>
                <TableHead>고장 복구</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">{worker.id}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{getStatusBadge(worker.status)}</TableCell>
                  <TableCell>{worker.processedCount}</TableCell>
                  <TableCell>{formatTime(worker.lastProcessedAt)}</TableCell>
                  <TableCell>
                    {worker.status === "BROKEN" && worker.brokenUntil
                      ? formatTime(worker.brokenUntil)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
