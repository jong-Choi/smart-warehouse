import { Suspense, useState } from "react";
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
import { CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocationWaybillsStatsSuspense } from "@/hooks/useWaybills";
import type { WaybillStatus } from "@/types";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LocationWaybillsContent() {
  const navigate = useNavigate();
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<WaybillStatus | "all">(
    "all"
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    undefined
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  // Suspense 데이터 패칭
  const { data: stats = [] } = useLocationWaybillsStatsSuspense({
    status: statusFilter === "all" ? undefined : statusFilter,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });
  // 챗봇 스토어에서 컨텍스트 수집 관련 상태 가져오기
  // const { setSystemContext, isCollecting, setIsMessagePending } = useChatbotStore();
  // chatbot에 사용할 컨텍스트
  // ... (기존 컨텍스트 useEffect 로직은 유지) ...
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
      case "PENDING_UNLOAD":
        return "bg-yellow-100 text-yellow-800";
      case "UNLOADED":
        return "bg-blue-100 text-blue-800";
      case "NORMAL":
        return "bg-green-100 text-green-800";
      case "ACCIDENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // 상태 한글 변환
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
                  <div className="p-4 bg-gray-50">
                    <Calendar
                      mode="range"
                      selected={tempDateRange}
                      onSelect={(range: DateRange | undefined) => {
                        setTempDateRange(range);
                      }}
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardLocationWaybillsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LocationWaybillsContent />
    </Suspense>
  );
}
