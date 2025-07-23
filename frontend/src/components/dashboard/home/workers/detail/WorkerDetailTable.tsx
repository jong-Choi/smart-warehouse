import React, { useState, useCallback, useMemo } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "@ui/table";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useOperatorParcels } from "@/hooks/useOperator";
import type { SortingState } from "@tanstack/react-table";
import { formatCurrency } from "@utils/formatString";

interface WorkerDetailTableProps {
  operatorId: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
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
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
  </TableRow>
));

DummyRow.displayName = "DummyRow";

export const WorkerDetailTable: React.FC<WorkerDetailTableProps> = ({
  operatorId,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data, isLoading, error } = useOperatorParcels(
    operatorId,
    pageIndex + 1,
    pageSize,
    statusFilter
  );

  const parcels = data?.data || [];
  const pagination = data?.pagination;

  const table = useReactTable({
    data: parcels,
    columns: [
      {
        accessorKey: "waybill.number",
        header: "운송장 번호",
        cell: ({ row }) => row.original.waybill.number,
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          switch (value) {
            case "NORMAL":
              return "정상";
            case "ACCIDENT":
              return "사고";
            case "UNLOADED":
              return "하차완료";
            case "PENDING_UNLOAD":
              return "하차대기";
            default:
              return value;
          }
        },
      },
      {
        accessorKey: "processedAt",
        header: "처리일시",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return new Date(value).toLocaleString("ko-KR");
        },
      },
      {
        accessorKey: "location.name",
        header: "배송지",
        cell: ({ row }) => row.original.location.name,
      },
      {
        accessorKey: "declaredValue",
        header: "운송가액",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return formatCurrency(value);
        },
      },
      {
        accessorKey: "isAccident",
        header: "사고여부",
        cell: ({ getValue }) => {
          const value = getValue() as boolean;
          return value ? "예" : "아니오";
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
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const currentPageRows = table.getPaginationRowModel().rows;
  const currentRowCount = currentPageRows.length;
  const dummyRowCount = Math.max(0, pageSize - currentRowCount);

  const dummyRows = useMemo(() => {
    return Array.from({ length: dummyRowCount }, (_, index) => (
      <DummyRow key={`dummy-${index}`} />
    ));
  }, [dummyRowCount]);

  const handleStatusFilterChange = useCallback(
    (value: string) => {
      onStatusFilterChange(value);
      setPageIndex(0); // 필터 변경 시 첫 페이지로
    },
    [onStatusFilterChange]
  );

  const handleGlobalFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilter(event.target.value);
    },
    []
  );

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPageIndex(0);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              처리 내역을 불러오는데 실패했습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">처리 내역</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {pagination?.total || 0}개
            </span>
          </div>
        </div>

        {/* 필터링 섹션 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">상태:</span>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="NORMAL">정상</SelectItem>
                <SelectItem value="ACCIDENT">사고</SelectItem>
                <SelectItem value="UNLOADED">하차완료</SelectItem>
                <SelectItem value="PENDING_UNLOAD">하차대기</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">검색:</span>
            <Input
              placeholder="운송장 번호 검색..."
              value={globalFilter}
              onChange={handleGlobalFilterChange}
              className="w-64"
            />
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-md border">
          <Table>
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">운송장 번호</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">처리일시</th>
                <th className="px-4 py-3 text-left font-medium">배송지</th>
                <th className="px-4 py-3 text-left font-medium">운송가액</th>
                <th className="px-4 py-3 text-left font-medium">사고여부</th>
              </tr>
            </thead>
            <TableBody>
              {currentPageRows.length ? (
                <>
                  {currentPageRows.map((row) => {
                    const parcel = row.original;
                    return (
                      <TableRow key={parcel.id}>
                        <TableCell className="font-medium">
                          {parcel.waybill.number}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            switch (parcel.status) {
                              case "NORMAL":
                                return "정상";
                              case "ACCIDENT":
                                return "사고";
                              case "UNLOADED":
                                return "하차완료";
                              case "PENDING_UNLOAD":
                                return "하차대기";
                              default:
                                return parcel.status;
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          {new Date(parcel.processedAt).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell>{parcel.location.name}</TableCell>
                        <TableCell>
                          {formatCurrency(parcel.declaredValue)}
                        </TableCell>
                        <TableCell>
                          {parcel.isAccident ? "예" : "아니오"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {dummyRows}
                </>
              ) : (
                <>
                  <TableRow>
                    <TableCell colSpan={6} className="h-12 text-center">
                      {(() => {
                        switch (statusFilter) {
                          case "NORMAL":
                            return "정상 처리 내역이 없습니다.";
                          case "ACCIDENT":
                            return "사고 처리 내역이 없습니다.";
                          case "UNLOADED":
                            return "하차 완료 내역이 없습니다.";
                          case "PENDING_UNLOAD":
                            return "하차 대기 내역이 없습니다.";
                          case "all":
                          default:
                            return "처리 내역이 없습니다.";
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                  {Array.from({ length: pageSize - 1 }, (_, index) => (
                    <DummyRow key={`dummy-empty-${index}`} />
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 페이징 */}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                페이지당 행 수:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
              >
                이전
              </Button>
              <span className="text-sm">
                {pageIndex + 1} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={pageIndex >= pagination.totalPages - 1}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
