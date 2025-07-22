import React, { useMemo } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/ui/table";
import { useWorkersStore } from "@/stores/workersStore";
import {
  StatsSection,
  WorkerTableRow,
} from "@/components/dashboard/workers/components";
import { StatContainer } from "@components/ui";

/**
 * 작업자 관리 테이블 컴포넌트
 * 작업자 목록과 통계 정보를 표시합니다.
 */
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
      <StatContainer className="p-6">
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
      </StatContainer>
    </div>
  );
};
