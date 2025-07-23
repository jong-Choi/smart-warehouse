import React, { useState, useCallback, useEffect, useMemo } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@ui/table";
import { Button } from "@components/ui/button";
import { useUnloadingTableStore } from "@/stores/unloadingTableStore";
import type {
  UnloadingParcel,
  UnloadingStatusFilter,
} from "@components/dashboard/home/waybills/types";
import {
  OptimizedTableRow,
  UnloadingTableHeader,
  TableFilters,
  TablePagination,
  DummyRow,
} from "@components/dashboard/home/waybills/table/components";
import { Stat } from "@components/ui";
import { formatCurrency } from "@utils/formatString";
import { generateMarkdownTable } from "@utils/tableToMarkdown";

interface UnloadingTableProps {
  parcels: UnloadingParcel[];
  onRefresh: () => void;
  isCollecting: boolean;
  setTableContextMessage: (message: string) => void;
}

export const UnloadingTable: React.FC<UnloadingTableProps> = ({
  parcels,
  onRefresh,
  isCollecting,
  setTableContextMessage,
}) => {
  // zustand store에서 상태 가져오기
  const {
    pageIndex,
    pageSize,
    lastPageIndex,
    globalFilter,
    statusFilter,
    sorting,
    setPageIndex,
    setPageSize,
    setLastPageIndex,
    setGlobalFilter,
    setStatusFilter,
    setSorting,
  } = useUnloadingTableStore([
    "pageIndex",
    "pageSize",
    "lastPageIndex",
    "globalFilter",
    "statusFilter",
    "sorting",
    "setPageIndex",
    "setPageSize",
    "setLastPageIndex",
    "setGlobalFilter",
    "setStatusFilter",
    "setSorting",
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: parcels,
    columns: [
      {
        accessorKey: "waybillId",
        header: "운송장 번호",
      },
      {
        accessorKey: "status",
        header: "상태",
      },
      {
        accessorKey: "createdAt",
        header: "등록일시",
      },
      {
        accessorKey: "unloadedAt",
        header: "하차일시",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return value ? new Date(value).toLocaleString("ko-KR") : "-";
        },
      },
      {
        accessorKey: "workerProcessedAt",
        header: "처리일시",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return value ? new Date(value).toLocaleString("ko-KR") : "-";
        },
      },
      {
        accessorKey: "processedBy",
        header: "처리 작업자",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return value || "-";
        },
      },
      {
        accessorKey: "declaredValue",
        header: "운송가액",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return formatCurrency(value);
        },
      },
    ],
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
    },
    // onPaginationChange 제거 - 테이블의 자동 페이지 변경을 방지
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    if (isCollecting) {
      const getStatusLabel = (status: string) => {
        switch (status) {
          case "PENDING_UNLOAD":
            return "하차 예정";
          case "UNLOADED":
            return "하차 완료";
          case "NORMAL":
            return "정상 처리";
          case "ACCIDENT":
            return "사고";
          default:
            return status;
        }
      };

      const markdownTable = generateMarkdownTable(table);
      const message = `⦁ 필터 조건:
- 검색어: ${globalFilter || "없음"}
- 상태 필터: ${statusFilter === "all" ? "전체" : getStatusLabel(statusFilter)}
- 현재 페이지: ${pageIndex + 1}
- 페이지당 표시: ${pageSize}개

⦁ 운송장 현황 테이블:
${markdownTable}

⦁ 총 ${parcels.length}개의 운송장이 있습니다.
`;

      setTableContextMessage(message);
    }
  }, [
    table,
    isCollecting,
    setTableContextMessage,
    parcels.length,
    globalFilter,
    statusFilter,
    pageIndex,
    pageSize,
  ]);

  const statusColumn = useMemo(() => table.getColumn("status"), [table]);
  // 상태 필터 변경 시 테이블에 반영 (table 객체 의존성 제거)
  useEffect(() => {
    if (statusColumn) {
      statusColumn.setFilterValue(statusFilter === "all" ? "" : statusFilter);
    }
  }, [statusFilter, statusColumn]); // table 의존성 제거

  const currentPageCount = useMemo(() => table.getPageCount(), [table]);
  // 최대 페이지 인덱스 업데이트
  useEffect(() => {
    const newLastPageIndex = Math.max(0, currentPageCount - 1);
    if (newLastPageIndex !== lastPageIndex) {
      setLastPageIndex(newLastPageIndex);
      // lastPageIndex가 줄어들었을 때 pageIndex도 즉시 보정
      if (pageIndex > newLastPageIndex) {
        setPageIndex(newLastPageIndex);
      }
    }
  }, [
    currentPageCount,
    lastPageIndex,
    setLastPageIndex,
    pageIndex,
    setPageIndex,
  ]);

  // 현재 페이지의 row 개수와 row 배열을 getPaginationRowModel로 계산
  const currentPageRows = table.getPaginationRowModel().rows;
  const currentRowCount = currentPageRows.length;
  // 더미 row 개수
  const dummyRowCount = Math.max(0, pageSize - currentRowCount);
  // 더미 row 배열
  const dummyRows = useMemo(() => {
    return Array.from({ length: dummyRowCount }, (_, index) => (
      <DummyRow key={`dummy-${index}`} />
    ));
  }, [dummyRowCount]);

  const handleStatusFilterChange = useCallback(
    (value: UnloadingStatusFilter) => {
      setStatusFilter(value);
    },
    [setStatusFilter]
  );

  const handleGlobalFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilter(event.target.value);
    },
    [setGlobalFilter]
  );

  const handlePageSizeChange = useCallback(
    (value: number) => {
      setPageSize(value);
    },
    [setPageSize]
  );

  return (
    <Stat.Container>
      <div className="flex items-center justify-between mb-4">
        <Stat.Head className="mb-0">운송장 목록</Stat.Head>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            총 {parcels.length}개
          </span>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 필터링 섹션 */}
      <TableFilters
        globalFilter={globalFilter}
        statusFilter={statusFilter}
        onGlobalFilterChange={handleGlobalFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* 테이블 */}
      <Table>
        <UnloadingTableHeader />
        <TableBody>
          {currentPageRows.length ? (
            <>
              {currentPageRows.map((row) => {
                const parcel = row.original;
                return (
                  <OptimizedTableRow
                    key={`${parcel.waybillId}-${parcel.status}-${
                      parcel.unloadedAt ||
                      parcel.workerProcessedAt ||
                      parcel.createdAt
                    }`}
                    parcel={parcel}
                    isSelected={row.getIsSelected()}
                  />
                );
              })}
              {/* 레이아웃 시프트 방지를 위한 더미 row - 메모이제이션된 배열 사용 */}
              {dummyRows}
            </>
          ) : (
            <>
              <TableRow>
                <TableCell colSpan={7} className="h-12 text-center">
                  {(() => {
                    switch (statusFilter) {
                      case "PENDING_UNLOAD":
                        return "하차 대기 운송장이 없습니다.";
                      case "UNLOADED":
                        return "하차 완료 운송장이 없습니다.";
                      case "NORMAL":
                        return "정상 운송장이 없습니다.";
                      case "ACCIDENT":
                        return "사고 운송장이 없습니다.";
                      case "all":
                      default:
                        return "하차 대기 중인 운송장이 없습니다.";
                    }
                  })()}
                </TableCell>
              </TableRow>
              {/* 빈 상태에서도 레이아웃 시프트 방지를 위한 더미 row (pageSize-1개) */}
              {Array.from({ length: pageSize - 1 }, (_, index) => (
                <DummyRow key={`dummy-empty-${index}`} />
              ))}
            </>
          )}
        </TableBody>
      </Table>

      {/* 페이징 */}
      <TablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalRows={parcels.length}
        filteredRows={table.getFilteredRowModel().rows.length}
        pageCount={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPageIndexChange={setPageIndex}
        onPageSizeChange={handlePageSizeChange}
      />
    </Stat.Container>
  );
};
