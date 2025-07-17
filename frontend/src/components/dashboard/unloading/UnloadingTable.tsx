import React, { useState, useMemo } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
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
import type { UnloadingParcel } from "./types";

interface UnloadingTableProps {
  parcels: UnloadingParcel[];
  onRefresh: () => void;
}

export const UnloadingTable: React.FC<UnloadingTableProps> = ({
  parcels,
  onRefresh,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const columns = useMemo<ColumnDef<UnloadingParcel>[]>(
    () => [
      {
        accessorKey: "waybillId",
        header: "운송장 번호",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("waybillId")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === "PENDING_UNLOAD"
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    : status === "UNLOADED"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : status === "NORMAL"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {status === "PENDING_UNLOAD" && "하차 대기"}
                {status === "UNLOADED" && "하차 완료"}
                {status === "NORMAL" && "정상"}
                {status === "ACCIDENT" && "사고"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "생성일시",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleString("ko-KR")}
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "업데이트일시",
        cell: ({ row }) => {
          const date = new Date(row.getValue("updatedAt"));
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleString("ko-KR")}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: parcels,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">운송장 목록</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {table.getFilteredRowModel().rows.length}개
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
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setGlobalFilter(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">상태:</span>
            <Select
              value={statusFilter}
              onValueChange={(value: string) => {
                setStatusFilter(value);
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value);
              }}
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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
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
            {table.getFilteredSelectedRowModel().rows.length}개 중{" "}
            {table.getFilteredRowModel().rows.length}개 표시
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">페이지당 행 수</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value: string) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              페이지 {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">첫 페이지로 이동</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">이전 페이지로 이동</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">다음 페이지로 이동</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
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
