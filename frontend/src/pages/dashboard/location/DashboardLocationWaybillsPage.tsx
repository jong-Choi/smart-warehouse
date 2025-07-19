import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchWaybillsByLocationStats,
  fetchWaybillsByLocationCalendarData,
} from "@/api/waybillApi";
import type { WaybillStatus } from "@/types";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationWaybillStats {
  locationId: number;
  locationName: string;
  address: string;
  count: number;
  statuses: { [key: string]: number };
}

export default function DashboardLocationWaybillsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LocationWaybillStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
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
    Record<
      string,
      {
        count: number;
        statuses: Record<string, number>;
        locations: Array<{ name: string; count: number }>;
      }
    >
  >({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [defaultMonth, setDefaultMonth] = useState<Date | undefined>(undefined);

  // 달력 데이터 로드
  const loadCalendarData = async () => {
    try {
      setCalendarLoading(true);
      const params: {
        status?: WaybillStatus;
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const data = await fetchWaybillsByLocationCalendarData(params);

      // 날짜별로 맵핑
      const dataMap: Record<
        string,
        {
          count: number;
          statuses: Record<string, number>;
          locations: Array<{ name: string; count: number }>;
        }
      > = {};
      let latestDate: Date | undefined;

      data.forEach(
        (item: {
          date: string;
          count: number;
          statuses: Record<string, number>;
          locations: Array<{ name: string; count: number }>;
        }) => {
          dataMap[item.date] = {
            count: item.count,
            statuses: item.statuses,
            locations: item.locations,
          };

          // 최신 날짜 찾기
          const itemDate = new Date(item.date);
          if (!latestDate || itemDate > latestDate) {
            latestDate = itemDate;
          }
        }
      );

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

  // 데이터 로드
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        status?: WaybillStatus;
        startDate?: Date;
        endDate?: Date;
      } = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (dateRange?.from) {
        params.startDate = dateRange.from;
      }
      if (dateRange?.to) {
        params.endDate = dateRange.to;
      }

      const data = await fetchWaybillsByLocationStats(params);
      setStats(data);
    } catch (err) {
      console.error("Error loading location waybill stats:", err);
      setError("지역별 운송장 통계를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadCalendarData();
  }, [statusFilter, dateRange]);

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

  // 상태별 색상 가져오기
  const getStatusColor = (status: string) => {
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

  // 상태 한글 변환
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_TRANSIT":
        return "배송중";
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStats} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            지역별 운송장 통계
          </h1>
          <p className="text-gray-600 mt-2">
            각 지역별 운송장 수량과 상태별 분포를 확인할 수 있습니다.
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" disabled={loading}>
          <RefreshCw
            className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
          />
          새로고침
        </Button>
      </div>

      {/* 필터 영역 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            필터링
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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
                  <SelectItem value="IN_TRANSIT">배송중</SelectItem>
                  <SelectItem value="DELIVERED">배송완료</SelectItem>
                  <SelectItem value="RETURNED">반송</SelectItem>
                  <SelectItem value="ERROR">오류</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 날짜 범위 선택 */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                날짜 범위
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
                          {format(dateRange.from, "yyyy-MM-dd", {
                            locale: ko,
                          })}{" "}
                          -{" "}
                          {format(dateRange.to, "yyyy-MM-dd", {
                            locale: ko,
                          })}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd", {
                          locale: ko,
                        })
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
                      defaultMonth={defaultMonth}
                      initialFocus
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
        </CardContent>
      </Card>

      {/* 통계 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>지역별 운송장 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      지역명
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      주소
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      총 운송장 수
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      상태별 분포
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                      >
                        조건에 맞는 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    stats.map((stat) => (
                      <tr key={stat.locationId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="font-medium">{stat.locationName}</div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-600">
                          {stat.address || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className="font-semibold text-lg">
                            {stat.count}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {Object.entries(stat.statuses).map(
                              ([status, count]) => (
                                <Badge
                                  key={status}
                                  className={cn(
                                    "text-xs",
                                    getStatusColor(status)
                                  )}
                                >
                                  {getStatusLabel(status)}: {count}
                                </Badge>
                              )
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/dashboard/location/waybills/${stat.locationId}`
                              )
                            }
                          >
                            상세 보기
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
