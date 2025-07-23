import React, {
  Suspense,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWaybillsByLocationSuspense } from "@/hooks/useWaybills";
import type { WaybillStatus, Waybill } from "@/types";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@pages/dashboard/workers/components";
import { STATUS_MAP } from "@utils/stautsMap";
import { StatusBadge } from "@ui/status-badge";
import { useLocationDetailMessage } from "@components/dashboard/waybills/location/detail/hooks";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/ui/table";
import { SortableHeader } from "@/ui/table";
import { generateMarkdownTable } from "@/utils/tableToMarkdown";

function LocationWaybillDetailContent() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WaybillStatus | "all">(
    "all"
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    undefined
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const limit = 20;

  // React Table 상태
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Suspense 데이터 패칭
  const { data } = useWaybillsByLocationSuspense(Number(locationId), {
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm.trim() || undefined,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
    page,
    limit,
  });
  const waybills = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };
  const locationName =
    waybills.length > 0 && waybills[0].location
      ? waybills[0].location.name
      : "";

  // 챗봇 메시지 훅
  const { setTableMessage, isCollecting } =
    useLocationDetailMessage(locationName);

  // 날짜 범위 적용
  const applyDateRange = () => {
    setDateRange(tempDateRange);
    setIsDatePickerOpen(false);
  };

  // 날짜 범위 초기화
  const clearDateRange = () => {
    setDateRange(undefined);
    setTempDateRange(undefined);
    setIsDatePickerOpen(false);
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
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
        accessorKey: "parcel.declaredValue",
        header: "소포 가격",
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
    [navigate]
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/location/waybills")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locationName} 지역 운송장 목록
            </h1>
            <p className="text-gray-600 mt-2">
              해당 지역으로 배송되는 운송장들을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 필터 영역 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            필터링 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* 검색어 */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                운송장 번호 검색
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="운송장 번호 입력"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
            </div>
            {/* 상태 필터 */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                배송 상태
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value: WaybillStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="PENDING_UNLOAD">하차 예정</SelectItem>
                  <SelectItem value="UNLOADED">하차 완료</SelectItem>
                  <SelectItem value="NORMAL">정상 처리</SelectItem>
                  <SelectItem value="ACCIDENT">사고</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 날짜 범위 선택 */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                발송 날짜 범위
              </label>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd", { locale: ko })}{" "}
                          - {format(dateRange.to, "yyyy-MM-dd", { locale: ko })}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd", { locale: ko })
                      )
                    ) : (
                      "날짜 범위 선택"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={tempDateRange?.from}
                    selected={tempDateRange}
                    onSelect={setTempDateRange}
                    numberOfMonths={2}
                    locale={ko}
                  />
                  <div className="flex justify-between p-3 border-t">
                    <Button variant="outline" onClick={clearDateRange}>
                      초기화
                    </Button>
                    <Button onClick={applyDateRange}>적용</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 운송장 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>운송장 목록 ({pagination.total}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                      colSpan={6}
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
                      onClick={() =>
                        navigate(`/dashboard/waybills/${row.original.id}`)
                      }
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
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                이전
              </Button>
              <div className="flex space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (pageNum) =>
                      Math.abs(pageNum - pagination.page) <= 2 ||
                      pageNum === 1 ||
                      pageNum === pagination.totalPages
                  )
                  .map((pageNum, index, array) => (
                    <React.Fragment key={pageNum}>
                      {index > 0 && array[index - 1] !== pageNum - 1 && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      <Button
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardLocationWaybillDetailPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={20} />}>
      <LocationWaybillDetailContent />
    </Suspense>
  );
}
