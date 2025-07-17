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
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import { Button } from "../../../ui/button";
import { useUnloadingTableStore } from "../../../stores/unloadingTableStore";
import type { UnloadingParcel } from "./types";
import {
  OptimizedTableRow,
  UnloadingTableHeader,
  TableFilters,
  TablePagination,
} from "./components";

interface UnloadingTableProps {
  parcels: UnloadingParcel[];
  onRefresh: () => void;
}

// 더미 row 컴포넌트를 별도로 분리하여 메모이제이션
const DummyRow = React.memo(() => (
  <TableRow className="opacity-0">
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
  </TableRow>
));

DummyRow.displayName = "DummyRow";

export const UnloadingTable: React.FC<UnloadingTableProps> = ({
  parcels,
  onRefresh,
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
  } = useUnloadingTableStore();

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
        header: "생성일시",
      },
      {
        accessorKey: "updatedAt",
        header: "업데이트일시",
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
    (value: string) => {
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
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">운송장 목록</h2>
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
        <div className="rounded-md border">
          <Table>
            <UnloadingTableHeader />
            <TableBody>
              {currentPageRows.length ? (
                <>
                  {currentPageRows.map((row) => {
                    const parcel = row.original;
                    return (
                      <OptimizedTableRow
                        key={`${parcel.id}-${parcel.status}-${parcel.updatedAt}`}
                        parcel={parcel}
                        isSelected={row.getIsSelected()}
                      />
                    );
                  })}
                  {/* 레이아웃 시프트 방지를 위한 더미 row - 메모이제이션된 배열 사용 */}
                  {dummyRows}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    하차 대기 중인 운송장이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
      </div>
    </div>
  );
};
