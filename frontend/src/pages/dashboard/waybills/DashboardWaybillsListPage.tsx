import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@components/ui/calendar";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { SectionHeader, PageLayout } from "@components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { CalendarIcon, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWaybillsSuspense } from "@/hooks/useWaybills";
import type { Waybill, WaybillStatus } from "@/types";
import type { DateRange } from "react-day-picker";
import { LoadingSkeleton } from "@components/dashboard/home/waybills";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";
import { useWaybillListMessage } from "@components/dashboard/waybills/home/hooks";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@ui/table";
import { SortableHeader } from "@ui/table";
import { generateMarkdownTable } from "@/utils/tableToMarkdown";
import { Stat } from "@components/ui";
import React from "react";

function WaybillsListContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTableMessage, isCollecting } = useWaybillListMessage();

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WaybillStatus | "all">(
    "all"
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }
    return undefined;
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    undefined
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // React Table 상태
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Suspense 데이터 패칭
  const { data } = useWaybillsSuspense({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter,
    startDate: dateRange?.from?.toISOString().split("T")[0],
    endDate: dateRange?.to?.toISOString().split("T")[0],
  });
  const waybills = data?.waybills || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(undefined);
    setTempDateRange(undefined);
    setCurrentPage(1);
    setSorting([]);
    setColumnFilters([]);
  };

  const handleWaybillSelect = (waybill: Waybill) => {
    navigate(`/dashboard/waybills/${waybill.id}`);
  };

  // 날짜 범위 적용
  const applyDateRange = () => {
    setDateRange(tempDateRange);
    setIsDatePickerOpen(false);
  };

  // 날짜 범위 초기화
  const clearDateRange = () => {
    setTempDateRange(undefined);
  };

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, dateRange]);

  // React Table 컬럼 정의
  const columns = useMemo(
    () => [
      {
        accessorKey: "number",
        header: "운송장 번호",
        enableSorting: true,
        cell: (info: { getValue: () => string }) => (
          <div className="font-medium">{info.getValue()}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "상태",
        enableSorting: true,
        cell: (info: { getValue: () => WaybillStatus }) => {
          const status = info.getValue();
          return (
            <StatusBadge color={STATUS_MAP[status].color}>
              {STATUS_MAP[status].text}
            </StatusBadge>
          );
        },
      },
      {
        accessorKey: "unloadDate",
        header: "하차 예정일",
        enableSorting: true,
        cell: (info: { getValue: () => string }) => (
          <span>
            {format(new Date(info.getValue()), "yyyy-MM-dd", {
              locale: ko,
            })}
          </span>
        ),
      },
      {
        accessorKey: "processedAt",
        header: "처리 일시",
        enableSorting: true,
        cell: (info: { getValue: () => string | null }) => {
          const value = info.getValue();
          return value ? (
            <span>
              {format(new Date(value), "yyyy-MM-dd HH:mm", { locale: ko })}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "operator.name",
        header: "작업자",
        enableSorting: true,
        cell: (info: { row: { original: Waybill } }) => (
          <span>{info.row.original.operator?.name || "-"}</span>
        ),
      },
      {
        accessorKey: "location.name",
        header: "배송지",
        enableSorting: true,
        cell: (info: { row: { original: Waybill } }) => (
          <span>{info.row.original.location?.name || "-"}</span>
        ),
      },
      {
        accessorKey: "parcel.declaredValue",
        header: "물건 가격",
        enableSorting: true,
        cell: (info: { row: { original: Waybill } }) => {
          const value = info.row.original.parcel?.declaredValue;
          return value ? (
            <span>{value.toLocaleString()}원</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
    ],
    []
  );

  // React Table 인스턴스 생성
  const table = useReactTable({
    data: waybills,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // 챗봇 메시지 설정
  useEffect(() => {
    if (isCollecting) {
      setTableMessage(generateMarkdownTable(table));
    }
  }, [isCollecting, setTableMessage, table]);

  // 정렬 핸들러
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

  return (
    <PageLayout>
      <div className="mb-6">
        <SectionHeader
          title="운송장 목록"
          description="등록된 모든 운송장 정보를 조회하고 관리할 수 있습니다."
        />
      </div>

      <Stat.Container>
        <div className="flex items-center justify-between mb-4">
          <Stat.Head className="mb-0">운송장 목록</Stat.Head>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {data?.total || 0}개
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 필터링 섹션 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="운송장 번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">상태:</span>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as WaybillStatus | "all")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="UNLOADED">하차 완료</SelectItem>
                <SelectItem value="NORMAL">정상 처리</SelectItem>
                <SelectItem value="ACCIDENT">사고</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">날짜:</span>
            <Popover
              open={isDatePickerOpen}
              onOpenChange={(open) => {
                setIsDatePickerOpen(open);
                if (open) {
                  setTempDateRange(dateRange);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "PPP", {
                        locale: ko,
                      })} - ${format(dateRange.to, "PPP", { locale: ko })}`
                    ) : (
                      format(dateRange.from, "PPP", { locale: ko })
                    )
                  ) : (
                    <span>날짜 범위 선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 bg-gray-50">
                  <Calendar
                    mode="range"
                    selected={tempDateRange}
                    onSelect={(range: DateRange | undefined) => {
                      setTempDateRange(range);
                    }}
                    locale={ko}
                    className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
                    classNames={{
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                      range_start:
                        "bg-gray-700 text-white hover:bg-gray-800 focus:bg-gray-800 rounded-l-md shadow-sm",
                      range_end:
                        "bg-gray-700 text-white hover:bg-gray-800 focus:bg-gray-800 rounded-r-md shadow-sm",
                      range_middle:
                        "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 border-t border-b border-gray-300",
                    }}
                  />
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-300">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateRange}
                      className="hover:bg-gray-100 border-gray-300"
                    >
                      초기화
                    </Button>
                    <Button
                      size="sm"
                      onClick={applyDateRange}
                      className="bg-gray-700 hover:bg-gray-800 text-white shadow-sm"
                    >
                      적용
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <SortableHeader
                    key={header.id}
                    columnId={header.column.id}
                    sorting={sorting}
                    onSort={handleSort}
                    className="text-left"
                  >
                    {header.column.columnDef.header as string}
                  </SortableHeader>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    조건에 맞는 운송장이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={`${row.original.id}-${index}`}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleWaybillSelect(row.original)}
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
              )}
            </TableBody>
          </Table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (pageNum) =>
                    Math.abs(pageNum - currentPage) <= 2 ||
                    pageNum === 1 ||
                    pageNum === totalPages
                )
                .map((pageNum, index, array) => (
                  <React.Fragment key={pageNum}>
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="px-2 py-1 text-gray-500">...</span>
                    )}
                    <Button
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        )}
      </Stat.Container>
    </PageLayout>
  );
}

export default function DashboardWaybillsListPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WaybillsListContent />
    </Suspense>
  );
}
