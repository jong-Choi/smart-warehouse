import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useUnloadingTableStore } from "../../../stores/unloadingTableStore";
import type { UnloadingParcel } from "./types";

// 최적화된 상태 셀 컴포넌트
const OptimizedStatusCell = React.memo<{ status: string }>(({ status }) => {
  const getStatusDisplay = useCallback((status: string) => {
    switch (status) {
      case "PENDING_UNLOAD":
        return {
          text: "하차 대기",
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
      case "UNLOADED":
        return {
          text: "하차 완료",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
      case "NORMAL":
        return {
          text: "정상",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "ACCIDENT":
        return {
          text: "사고",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      default:
        return {
          text: status,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  }, []);

  const statusInfo = getStatusDisplay(status);

  return (
    <div className="flex items-center">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    </div>
  );
});

OptimizedStatusCell.displayName = "OptimizedStatusCell";

// 최적화된 날짜 셀 컴포넌트
const OptimizedDateCell = React.memo<{ date: string }>(({ date }) => {
  const formattedDate = useMemo(() => {
    return new Date(date).toLocaleString("ko-KR");
  }, [date]);

  return <div className="text-sm text-muted-foreground">{formattedDate}</div>;
});

OptimizedDateCell.displayName = "OptimizedDateCell";

// 최적화된 테이블 행 컴포넌트
const OptimizedTableRow = React.memo<{
  parcel: UnloadingParcel;
  isSelected?: boolean;
}>(({ parcel, isSelected }) => {
  return (
    <TableRow data-state={isSelected && "selected"}>
      <TableCell>
        <div className="font-medium">{parcel.waybillId}</div>
      </TableCell>
      <TableCell>
        <OptimizedStatusCell status={parcel.status} />
      </TableCell>
      <TableCell>
        <OptimizedDateCell date={parcel.createdAt} />
      </TableCell>
      <TableCell>
        <OptimizedDateCell date={parcel.updatedAt} />
      </TableCell>
    </TableRow>
  );
});

OptimizedTableRow.displayName = "OptimizedTableRow";

interface UnloadingTableProps {
  parcels: UnloadingParcel[];
  onRefresh: () => void;
}

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

  // 상태 필터 변경 시 테이블에 반영 (table 객체 의존성 제거)
  useEffect(() => {
    const statusColumn = table.getColumn("status");
    if (statusColumn) {
      statusColumn.setFilterValue(statusFilter === "all" ? "" : statusFilter);
    }
  }, [statusFilter]); // table 의존성 제거

  // 최대 페이지 인덱스 업데이트
  useEffect(() => {
    const currentPageCount = table.getPageCount();
    const newLastPageIndex = Math.max(0, currentPageCount - 1);
    if (newLastPageIndex !== lastPageIndex) {
      setLastPageIndex(newLastPageIndex);
    }
  }, [table.getPageCount(), lastPageIndex, setLastPageIndex]);

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
    (value: string) => {
      setPageSize(Number(value));
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
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="운송장 번호로 검색..."
              value={globalFilter ?? ""}
              onChange={handleGlobalFilterChange}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">상태:</span>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PENDING_UNLOAD">하차 대기</SelectItem>
                <SelectItem value="UNLOADED">하차 완료</SelectItem>
                <SelectItem value="NORMAL">정상</SelectItem>
                <SelectItem value="ACCIDENT">사고</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>운송장 번호</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>생성일시</TableHead>
                <TableHead>업데이트일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => {
                    const parcel = row.original;
                    return (
                      <OptimizedTableRow
                        key={`${parcel.id}-${parcel.status}-${parcel.updatedAt}`}
                        parcel={parcel}
                        isSelected={row.getIsSelected()}
                      />
                    );
                  })}
                  {/* 레이아웃 시프트 방지를 위한 더미 row */}
                  {Array.from({
                    length: Math.max(
                      0,
                      pageSize - table.getRowModel().rows.length
                    ),
                  }).map((_, index) => (
                    <TableRow key={`dummy-${index}`} className="opacity-0">
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
                  ))}
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
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {parcels.length}개 중 {table.getFilteredRowModel().rows.length}개
            표시
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">페이지당 행 수</p>
              <Select
                value={`${pageSize}`}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              페이지 {pageIndex + 1} / {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">첫 페이지로 이동</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">이전 페이지로 이동</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">다음 페이지로 이동</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">마지막 페이지로 이동</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
