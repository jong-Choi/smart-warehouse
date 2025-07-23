import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@components/ui/calendar";
import { Button } from "@components/ui/button";
import { SectionHeader, PageLayout } from "@components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocationWaybillsStatsSuspense } from "@/hooks/useWaybills";
import type { WaybillStatus } from "@/types";

interface LocationWaybillStat {
  locationId: number;
  locationName: string;
  address: string | null;
  count: number;
  statuses: Record<string, number>;
}
import type { DateRange } from "react-day-picker";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";
import { useLocationWaybillMessage } from "@components/dashboard/waybills/location/hooks";
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
import { LoadingSkeleton } from "@components/dashboard/home/waybills";

function LocationWaybillsContent() {
  const navigate = useNavigate();
  const { setTableMessage, isCollecting } = useLocationWaybillMessage();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    undefined
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // React Table 상태
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Suspense 데이터 패칭
  const { data: stats = [] }: { data: LocationWaybillStat[] } =
    useLocationWaybillsStatsSuspense({
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    });

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

  // React Table 컬럼 정의
  const columns = useMemo(
    () => [
      {
        accessorKey: "locationName",
        header: "지역명",
        enableSorting: true,
        cell: (info: { getValue: () => string }) => (
          <div className="font-medium">{info.getValue()}</div>
        ),
      },
      {
        accessorKey: "address",
        header: "주소",
        enableSorting: true,
        cell: (info: { getValue: () => string }) => (
          <span className="text-gray-600">{info.getValue() || "-"}</span>
        ),
      },
      {
        accessorKey: "count",
        header: "총 운송장 수",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => (
          <span className="font-semibold text-lg">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "statuses",
        header: "상태별 분포",
        enableSorting: false,
        cell: (info: { getValue: () => Record<string, number> }) => {
          const statuses = info.getValue();
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(statuses).map(([status, count]) => {
                if (Object.keys(STATUS_MAP).includes(status)) {
                  return (
                    <StatusBadge
                      key={status}
                      color={STATUS_MAP[status as WaybillStatus].color}
                    >
                      {STATUS_MAP[status as WaybillStatus].text}: {count}
                    </StatusBadge>
                  );
                }
                return null;
              })}
            </div>
          );
        },
      },
    ],
    []
  );

  // React Table 인스턴스 생성
  const table = useReactTable({
    data: stats,
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
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="지역별 운송장 통계"
          description="각 지역별 운송장 수량과 상태별 분포를 확인할 수 있습니다."
        />
      </div>

      <Stat.Container>
        <div className="flex items-center justify-between mb-4">
          <Stat.Head className="mb-0">지역별 운송장 현황</Stat.Head>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {stats.length}개 지역
            </span>
          </div>
        </div>

        {/* 필터링 섹션 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">날짜:</span>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy-MM-dd", { locale: ko })} -{" "}
                        {format(dateRange.to, "yyyy-MM-dd", { locale: ko })}
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
                    className={
                      header.column.id === "statuses"
                        ? "text-center"
                        : "text-left"
                    }
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
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    조건에 맞는 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={`${row.original.locationId}-${index}`}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/dashboard/location/waybills/${row.original.locationId}`
                      )
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
      </Stat.Container>
    </PageLayout>
  );
}

export default function DashboardLocationWaybillsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LocationWaybillsContent />
    </Suspense>
  );
}
