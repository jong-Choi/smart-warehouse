import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableHeader, TableRow } from "@/ui/table";
import { SortableHeader } from "@/ui/table";
import { useWorkersStore } from "@/stores/workersStore";
import {
  StatsSection,
  WorkerTableRow,
} from "@components/dashboard/home/workers/components";
import { StatContainer } from "@components/ui";
import {
  calculateAccidentRate,
  calculateUtilization,
  formatTime,
  formatWorkTime,
} from "@components/dashboard/home/workers/utils/calculations";
import type { Worker } from "@components/dashboard/home/workers/types";
import { generateMarkdownTable } from "@utils/tableToMarkdown";
import { useShallow } from "zustand/shallow";

/**
 * 작업자 관리 테이블 컴포넌트
 * 작업자 목록과 통계 정보를 표시합니다.
 */
export const WorkersTable: React.FC<{
  setTableContextMessage: (message: string) => void;
  isCollecting: boolean;
}> = ({ setTableContextMessage, isCollecting }) => {
  const { workers, activeWorkersLength, stats } = useWorkersStore(
    useShallow((state) => ({
      workers: state.workers,
      activeWorkersLength: state.activeWorkers.length,
      stats: state.stats,
    }))
  );

  // 통계 데이터를 메모이제이션
  const memoizedStats = useMemo(() => stats, [stats]);
  // 작업자 목록을 메모이제이션
  const memoizedWorkers = useMemo(() => workers, [workers]);

  // 정렬 상태 관리
  const [sorting, setSorting] = useState<SortingState>([]);

  // 컬럼 정의
  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "작업자 ID",
      },
      {
        accessorKey: "name",
        header: "이름",
      },
      {
        accessorKey: "status",
        header: "상태",
      },
      {
        accessorKey: "processedCount",
        header: "정상 건수",
      },
      {
        accessorKey: "accidentCount",
        header: "파손 건수",
      },
      {
        accessorKey: "accidentRate",
        header: "사고율",
        accessorFn: (row: Worker) =>
          calculateAccidentRate(row.processedCount, row.accidentCount),
      },
      {
        accessorKey: "workStartedAt",
        header: "작업 시작",
        accessorFn: (row: Worker) => formatTime(row.workStartedAt),
      },
      {
        accessorKey: "totalWorkTime",
        header: "처리시간",
        accessorFn: (row: Worker) => formatWorkTime(row.totalWorkTime),
      },
      {
        accessorKey: "utilization",
        header: "가동률",
        accessorFn: (row: Worker) =>
          calculateUtilization(row.totalWorkTime, row.workStartedAt),
      },
    ],
    []
  );

  // 테이블 인스턴스 생성
  const table = useReactTable({
    data: memoizedWorkers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // 헤더 정렬 핸들러
  const handleSort = useCallback((columnId: string) => {
    setSorting((prev) => {
      const currentSort = prev.find((sort) => sort.id === columnId);
      if (!currentSort) {
        return [{ id: columnId, desc: false }];
      } else if (!currentSort.desc) {
        return [{ id: columnId, desc: true }];
      } else {
        return [];
      }
    });
  }, []);

  useEffect(() => {
    if (!isCollecting) return;
    const markdownTable = generateMarkdownTable(table);
    const message = `
⦁ 시간: ${new Date().toLocaleString()}

⦁ 전체 현황:
- 총 작업자 수: ${stats.totalWorkers}명
- 근무중인 작업자: ${activeWorkersLength}명
- 작업중: ${memoizedStats.workingWorkers}명
- 대기중: ${memoizedStats.idleWorkers}명
- 사고처리중: ${memoizedStats.brokenWorkers}명

⦁ 작업자 현황 테이블:
${markdownTable}
`;
    setTableContextMessage(message);
  }, [
    isCollecting,
    memoizedWorkers.length,
    setTableContextMessage,
    table,
    memoizedStats,
    activeWorkersLength,
    stats.totalWorkers,
  ]);

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <StatsSection stats={memoizedStats} />

      {/* 작업자 테이블 */}
      <StatContainer className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <SortableHeader
                  key={col.accessorKey as string}
                  columnId={col.accessorKey as string}
                  sorting={sorting}
                  onSort={handleSort}
                >
                  {col.header as React.ReactNode}
                </SortableHeader>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <WorkerTableRow key={row.original.id} worker={row.original} />
            ))}
          </TableBody>
        </Table>
      </StatContainer>
    </div>
  );
};
