import React, { useState, useEffect, useCallback } from "react";
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
import {
  CalendarIcon,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWaybillsByLocation } from "@/api/waybillApi";
import type { Waybill, WaybillStatus } from "@/types";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChatbotStore } from "@/stores/chatbotStore";

export default function DashboardLocationWaybillDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  // 챗봇 스토어에서 컨텍스트 수집 관련 상태 가져오기
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore();

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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // 데이터 로드
  const loadWaybills = useCallback(async () => {
    if (!locationId) return;

    try {
      setLoading(true);
      setError(null);

      const params: {
        status?: WaybillStatus;
        search?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
      } = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (dateRange?.from) {
        params.startDate = dateRange.from;
      }
      if (dateRange?.to) {
        params.endDate = dateRange.to;
      }

      const response = await fetchWaybillsByLocation(
        parseInt(locationId),
        params
      );
      setWaybills(response.data);
      setPagination(response.pagination);

      // 첫 번째 운송장에서 지역명 추출
      if (response.data.length > 0 && response.data[0].location) {
        setLocationName(response.data[0].location.name);
      }
    } catch (err) {
      console.error("Error loading waybills by location:", err);
      setError("운송장 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [
    locationId,
    statusFilter,
    searchTerm,
    dateRange,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    loadWaybills();
  }, [
    locationId,
    statusFilter,
    searchTerm,
    dateRange,
    pagination.page,
    loadWaybills,
  ]);

  // 검색어 변경 시 첫 페이지로 이동
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [searchTerm, statusFilter, dateRange, pagination.page]);

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    // isCollecting이 true일 때만 systemContext 업데이트
    if (waybills && isCollecting) {
      // 날짜 범위 정보
      const dateRangeText = dateRange?.from
        ? dateRange.to
          ? `${format(dateRange.from, "yyyy-MM-dd", { locale: ko })} ~ ${format(
              dateRange.to,
              "yyyy-MM-dd",
              { locale: ko }
            )}`
          : `${format(dateRange.from, "yyyy-MM-dd", { locale: ko })} 이후`
        : "전체 기간";

      // 상태별 통계 계산
      const statusStats: Record<string, number> = {};
      waybills.forEach((waybill) => {
        statusStats[waybill.status] = (statusStats[waybill.status] || 0) + 1;
      });

      const context = `현재 페이지: 지역별 운송장 상세 목록 (/dashboard/location/waybills/${locationId})
⦁ 시간: ${new Date().toLocaleString()}

⦁ 지역 정보:
- 지역 ID: ${locationId}
- 지역명: ${locationName}

⦁ 전체 현황:
- 총 운송장 수: ${waybills.length}개
- 조회 기간: ${dateRangeText}

⦁ 필터 조건:
- 검색어: ${searchTerm || "없음"}
- 상태 필터: ${statusFilter === "all" ? "전체" : getStatusLabel(statusFilter)}
- 날짜 범위: ${dateRangeText}
- 현재 페이지: ${pagination.page}/${pagination.totalPages}

⦁ 상태별 분포:
${Object.entries(statusStats)
  .map(
    ([status, count]) =>
      `- ${getStatusLabel(status as WaybillStatus)}: ${count}개`
  )
  .join("\n")}

⦁ 운송장 목록 (최대 ${pagination.limit}개씩):
${waybills
  .map(
    (waybill) =>
      `- ${waybill.number}: ${getStatusLabel(waybill.status)} (${format(
        new Date(waybill.unloadDate),
        "yyyy-MM-dd",
        { locale: ko }
      )})`
  )
  .join("\n")}

⦁ 사용자가 현재 보고 있는 정보:
- ${locationName} 지역으로 배송되는 운송장들의 상세 목록
- 운송장 번호, 상태, 발송일시, 배송완료일시, 소포 가격 정보 확인 가능
- 검색, 상태 필터, 날짜 범위 필터로 원하는 운송장 조회 가능
- 페이지네이션으로 많은 운송장 목록을 효율적으로 탐색 가능
- 각 운송장의 상세 정보로 이동할 수 있는 기능 제공`;
      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [
    waybills,
    locationId,
    locationName,
    searchTerm,
    statusFilter,
    dateRange,
    pagination,
    setSystemContext,
    isCollecting,
    setIsMessagePending,
  ]);

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
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // 상태별 색상 가져오기
  const getStatusColor = (status: WaybillStatus) => {
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
  const getStatusLabel = (status: WaybillStatus) => {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadWaybills} variant="outline">
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
        <Button onClick={loadWaybills} variant="outline" disabled={loading}>
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
                  <Calendar
                    initialFocus
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
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        운송장 번호
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        상태
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        하차 예정일
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        처리 일시
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        소포 가격
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {waybills.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                        >
                          조건에 맞는 운송장이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      waybills.map((waybill) => (
                        <tr key={waybill.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="font-medium">{waybill.number}</div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <Badge className={getStatusColor(waybill.status)}>
                              {getStatusLabel(waybill.status)}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {format(
                              new Date(waybill.unloadDate),
                              "yyyy-MM-dd",
                              {
                                locale: ko,
                              }
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {waybill.processedAt
                              ? format(
                                  new Date(waybill.processedAt),
                                  "yyyy-MM-dd HH:mm",
                                  {
                                    locale: ko,
                                  }
                                )
                              : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {waybill.parcel?.declaredValue
                              ? `${waybill.parcel.declaredValue.toLocaleString()}원`
                              : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/dashboard/waybills/${waybill.id}`)
                              }
                            >
                              상세보기
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          Math.abs(page - pagination.page) <= 2 ||
                          page === 1 ||
                          page === pagination.totalPages
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                          <Button
                            variant={
                              pagination.page === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
