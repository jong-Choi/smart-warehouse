import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperatorDetail } from "@/hooks/useOperator";
import { useChatbotStore } from "@/stores/chatbotStore";
import {
  DetailHeader,
  OperatorInfoCards,
  ParcelFilters,
  ParcelTable,
} from "./components";

export function DashboardWorkerDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 챗봇 스토어에서 컨텍스트 수집 관련 상태 가져오기
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore();

  const {
    data: operator,
    isLoading,
    error,
  } = useOperatorDetail(
    code || "",
    page,
    pageSize,
    statusFilter,
    startDate || undefined,
    endDate || undefined
  );

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    // isCollecting이 true일 때만 systemContext 업데이트
    if (operator && isCollecting) {
      // 성과 데이터 계산 - parcels 배열에서 계산 (전체 데이터)
      const totalProcessed = operator.parcelsPagination?.total || 0;
      const normalParcels =
        operator.parcels?.filter((p) => p.status === "NORMAL").length || 0;
      const accidentParcels =
        operator.parcels?.filter((p) => p.status === "ACCIDENT").length || 0;

      // 현재 페이지의 택배들에서 수익 계산
      const currentPageRevenue =
        operator.parcels?.reduce(
          (sum, parcel) => sum + (parcel.declaredValue || 0),
          0
        ) || 0;

      // 처리율 계산 (정상 처리 / 전체 처리)
      const parcelRate =
        totalProcessed > 0
          ? ((normalParcels / totalProcessed) * 100).toFixed(1)
          : "0.0";

      // 현재 페이지 택배들의 평균 운송가액
      const avgDeclaredValue =
        operator.parcels && operator.parcels.length > 0
          ? operator.parcels.reduce(
              (sum, parcel) => sum + (parcel.declaredValue || 0),
              0
            ) / operator.parcels.length
          : 0;

      // 최근 처리된 택배 정보
      const recentParcels =
        operator.parcels?.filter(
          (parcel) => parcel.waybill && parcel.waybill.number
        ) || [];

      const context = `현재 페이지: 작업자 상세 정보 (/dashboard/workers/${code})
⦁ 시간: ${new Date().toLocaleString()}

⦁ 작업자 정보:
- 이름: ${operator.name}
- 코드: ${operator.code}
- 타입: ${operator.type}
- 생성일: ${new Date(operator.createdAt).toLocaleDateString()}

⦁ 작업자 성과 (전체):
- 총 처리 택배: ${totalProcessed}개
- 정상 처리: ${normalParcels}개
- 사고 발생: ${accidentParcels}개
- 처리율: ${parcelRate}%
- 현재 페이지 택배 수익: ${currentPageRevenue.toLocaleString()}원
- 평균 운송가액: ${avgDeclaredValue.toLocaleString()}원

⦁ 택배 목록 필터 조건:
- 상태 필터: ${statusFilter}
- 시작일: ${startDate || "없음"}
- 종료일: ${endDate || "없음"}
- 현재 페이지: ${page}/${operator.parcelsPagination?.totalPages || 1}
- 페이지당 표시: ${pageSize}개

⦁ 택배 목록 현황:
- 총 택배 수: ${operator.parcelsPagination?.total || 0}개
- 현재 표시된 택배: ${operator.parcels?.length || 0}개
- 현재 페이지 택배 상태 분포:
  * 정상: ${
    operator.parcels?.filter((p) => p.status === "NORMAL").length || 0
  }개
  * 사고: ${
    operator.parcels?.filter((p) => p.status === "ACCIDENT").length || 0
  }개
  * 하역 대기: ${
    operator.parcels?.filter((p) => p.status === "PENDING_UNLOAD").length || 0
  }개
  * 하역 완료: ${
    operator.parcels?.filter((p) => p.status === "UNLOADED").length || 0
  }개

⦁ 최근 처리된 택배들:
\`\`\`
${recentParcels
  .map(
    (parcel) =>
      `- ${parcel.waybill.number}: ${
        parcel.status
      } (운송가액: ${parcel.declaredValue?.toLocaleString()}원, 처리일시: ${new Date(
        parcel.processedAt
      ).toLocaleString()})`
  )
  .join("\n")}
\`\`\`

⦁ 사용자가 현재 보고 있는 정보:
- 특정 작업자의 상세 정보와 성과 지표
- 해당 작업자가 처리한 택배들의 목록과 상태
- 필터링과 페이지네이션으로 택배 데이터 탐색 가능
- 각 택배의 운송장 번호, 상태, 배송지, 운송가액, 처리일시 확인 가능`;
      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [
    operator,
    code,
    statusFilter,
    startDate,
    endDate,
    page,
    pageSize,
    setSystemContext,
    isCollecting,
    setIsMessagePending,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            작업자 정보를 불러오는데 실패했습니다.
          </p>
        </div>
      </div>
    );
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setPage(1);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <DetailHeader operator={operator} />
      <OperatorInfoCards operator={operator} />

      <ParcelFilters
        statusFilter={statusFilter}
        startDate={startDate}
        endDate={endDate}
        onStatusFilterChange={handleStatusFilterChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      <ParcelTable
        parcels={operator.parcels}
        total={operator.parcelsPagination?.total || 0}
      />

      {/* 페이징 */}
      {operator.parcelsPagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              페이지당 행 수:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
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
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              이전
            </Button>
            <span className="text-sm">
              {page} / {operator.parcelsPagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= operator.parcelsPagination.totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
