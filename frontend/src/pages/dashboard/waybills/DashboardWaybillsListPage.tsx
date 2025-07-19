import React, { useState, useEffect } from "react";
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
import { CalendarIcon, Search, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWaybills, fetchWaybillCalendarData } from "@/api/waybillApi";
import type { Waybill, WaybillStatus } from "@/types";
import type { DateRange } from "react-day-picker";

interface WaybillsListPageProps {
  onWaybillSelect?: (waybill: Waybill) => void;
}

export default function DashboardWaybillsListPage({
  onWaybillSelect,
}: WaybillsListPageProps) {
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 달력 데이터
  const [calendarData, setCalendarData] = useState<
    Record<string, { count: number; statuses: Record<string, number> }>
  >({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [defaultMonth, setDefaultMonth] = useState<Date | undefined>(undefined);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // 달력 데이터 로드
  const loadCalendarData = async () => {
    try {
      setCalendarLoading(true);
      const data = await fetchWaybillCalendarData();

      // 날짜별로 맵핑
      const dataMap: Record<
        string,
        { count: number; statuses: Record<string, number> }
      > = {};
      let latestDate: Date | undefined;

      data.forEach((item) => {
        dataMap[item.date] = {
          count: item.count,
          statuses: item.statuses,
        };

        // 최신 날짜 찾기
        const itemDate = new Date(item.date);
        if (!latestDate || itemDate > latestDate) {
          latestDate = itemDate;
        }
      });

      setCalendarData(dataMap);

      // 최신 날짜가 있으면 해당 월을 기본값으로 설정
      if (latestDate) {
        setDefaultMonth(latestDate);
      }
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWaybills({
          page: currentPage,
          pageSize,
          search: searchTerm,
          status: statusFilter === "all" ? undefined : statusFilter,
          date: dateRange?.from,
          endDate: dateRange?.to,
        });

        setWaybills(response.waybills);
        setTotalPages(Math.ceil(response.total / pageSize));
      } catch (err) {
        setError("운송장 목록을 불러오는데 실패했습니다.");
        console.error("Failed to load waybills:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    loadCalendarData();
  }, []);

  // 필터 변경 시 재로드 (검색은 디바운스 적용)
  useEffect(() => {
    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await fetchWaybills({
            page: currentPage,
            pageSize,
            search: searchTerm,
            status: statusFilter === "all" ? undefined : statusFilter,
            date: dateRange?.from,
            endDate: dateRange?.to,
          });

          setWaybills(response.waybills);
          setTotalPages(Math.ceil(response.total / pageSize));
        } catch (err) {
          setError("운송장 목록을 불러오는데 실패했습니다.");
          console.error("Failed to load waybills:", err);
        } finally {
          setLoading(false);
        }
      },
      searchTerm ? 300 : 0
    ); // 검색어가 있을 때만 디바운스 적용

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, dateRange, currentPage]);

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(undefined);
    setTempDateRange(undefined);
    setCurrentPage(1);
    setError(null);
  };

  // 운송장 선택
  const handleWaybillSelect = (waybill: Waybill) => {
    if (onWaybillSelect) {
      onWaybillSelect(waybill);
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeClass = (status: WaybillStatus) => {
    switch (status) {
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: WaybillStatus) => {
    switch (status) {
      case "IN_TRANSIT":
        return "운송중";
      case "DELIVERED":
        return "배송완료";
      case "RETURNED":
        return "반송";
      case "ERROR":
        return "오류";
      default:
        return status;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);

                const response = await fetchWaybills({
                  page: currentPage,
                  pageSize,
                  search: searchTerm,
                  status: statusFilter === "all" ? undefined : statusFilter,
                  date: dateRange?.from,
                });

                setWaybills(response.waybills);
                setTotalPages(Math.ceil(response.total / pageSize));
              } catch (err) {
                setError("운송장 목록을 불러오는데 실패했습니다.");
                console.error("Failed to load waybills:", err);
              } finally {
                setLoading(false);
              }
            }}
            variant="outline"
            className="mt-4"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">운송장 목록</h1>
        <p className="text-muted-foreground">
          등록된 모든 운송장 정보를 조회하고 관리할 수 있습니다.
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">필터</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="운송장 번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* 상태 필터 */}
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as WaybillStatus | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="IN_TRANSIT">운송중</SelectItem>
              <SelectItem value="DELIVERED">배송완료</SelectItem>
              <SelectItem value="RETURNED">반송</SelectItem>
              <SelectItem value="ERROR">오류</SelectItem>
            </SelectContent>
          </Select>

          {/* 날짜 필터 */}
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
                  "justify-start text-left font-normal",
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
                  defaultMonth={defaultMonth}
                  initialFocus
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
                  components={{
                    DayButton: ({ children, modifiers, day, ...props }) => {
                      const dateStr = day.date.toISOString().split("T")[0];
                      const dayData = calendarData[dateStr];
                      const hasWaybills = dayData && dayData.count > 0;
                      const isCurrentMonth = !modifiers.outside;

                      return (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-9 w-9 p-0 transition-colors relative z-10",
                              // 현재 월의 날짜들
                              isCurrentMonth &&
                                hasWaybills &&
                                "text-foreground font-medium",
                              isCurrentMonth &&
                                !hasWaybills &&
                                "text-muted-foreground opacity-70",
                              // 이전/다음 달의 날짜들
                              modifiers.outside &&
                                "text-muted-foreground opacity-30"
                            )}
                            {...props}
                          >
                            {children}
                          </Button>
                          {!calendarLoading && hasWaybills && (
                            <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-20 shadow-sm border border-gray-500">
                              {dayData.count}
                            </div>
                          )}
                        </div>
                      );
                    },
                  }}
                />
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-300">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTempDateRange(dateRange);
                      setIsDatePickerOpen(false);
                    }}
                    className="hover:bg-gray-100 border-gray-300"
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDateRange(tempDateRange);
                      setIsDatePickerOpen(false);
                    }}
                    className="bg-gray-700 hover:bg-gray-800 text-white shadow-sm"
                  >
                    확인
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* 새로고침 */}
          <Button
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);

                const response = await fetchWaybills({
                  page: currentPage,
                  pageSize,
                  search: searchTerm,
                  status: statusFilter === "all" ? undefined : statusFilter,
                  date: dateRange?.from,
                  endDate: dateRange?.to,
                });

                setWaybills(response.waybills);
                setTotalPages(Math.ceil(response.total / pageSize));
              } catch (err) {
                setError("운송장 목록을 불러오는데 실패했습니다.");
                console.error("Failed to load waybills:", err);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 테이블 섹션 */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">운송장 목록</h2>
          <p className="text-sm text-muted-foreground mt-1">
            총 {waybills.length}개의 운송장이 있습니다.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">
              운송장 목록을 불러오는 중...
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">운송장 번호</th>
                    <th className="text-left p-4 font-medium">상태</th>
                    <th className="text-left p-4 font-medium">출발일</th>
                    <th className="text-left p-4 font-medium">도착일</th>
                    <th className="text-left p-4 font-medium">소포 수</th>
                    <th className="text-left p-4 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {waybills.map((waybill) => (
                    <tr
                      key={waybill.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleWaybillSelect(waybill)}
                    >
                      <td className="p-4 font-medium">{waybill.number}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusBadgeClass(waybill.status)
                          )}
                        >
                          {getStatusText(waybill.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        {format(new Date(waybill.shippedAt), "yyyy-MM-dd", {
                          locale: ko,
                        })}
                      </td>
                      <td className="p-4">
                        {waybill.deliveredAt
                          ? format(
                              new Date(waybill.deliveredAt),
                              "yyyy-MM-dd",
                              { locale: ko }
                            )
                          : "-"}
                      </td>
                      <td className="p-4">{waybill.parcels.length}개</td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWaybillSelect(waybill);
                          }}
                        >
                          상세보기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="p-6 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    페이지 {currentPage} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.max(1, currentPage - 1);
                        setCurrentPage(newPage);
                      }}
                      disabled={currentPage === 1}
                    >
                      이전
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.min(totalPages, currentPage + 1);
                        setCurrentPage(newPage);
                      }}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
