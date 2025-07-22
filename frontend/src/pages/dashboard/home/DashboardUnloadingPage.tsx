import { useState, useEffect, useCallback } from "react";
import {
  UnloadingTable,
  UnloadingInfo,
} from "@/components/dashboard/unloading";
import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import { useUnloadingTableStore } from "@/stores/unloadingTableStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import type { UnloadingParcel } from "@/components/dashboard/unloading/types";

// 로딩 스켈레톤 컴포넌트
const LoadingSkeleton = () => (
  <div className="bg-card rounded-lg border">
    <div className="p-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* 테이블 영역 */}
      <div className="rounded-md border">
        {/* 테이블 헤더 */}
        <div className="border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-4 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* 테이블 바디 */}
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-3">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이징 영역 */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// 페이지 헤더 컴포넌트
const PageHeader = () => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold">실시간 운송장 현황</h1>
    <p className="text-muted-foreground">
      운송장의 실시간 처리 현황과 상태를 상세히 확인할 수 있습니다.
    </p>
  </div>
);

export default function DashboardUnloadingPage() {
  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore();

  // 데이터 존재 여부만 구독 (parcels 배열 자체는 구독하지 않음)
  const hasData = useUnloadingParcelsStore(
    (state) => state.parcels && state.parcels.length > 0
  );

  // 테이블 상태 가져오기
  const { pageIndex, pageSize, globalFilter, statusFilter } =
    useUnloadingTableStore();

  // 스냅샷 상태 관리
  const [tableData, setTableData] = useState<UnloadingParcel[] | null>(null);

  // 스냅샷 생성 함수 (getState 사용)
  const createSnapshot = useCallback(() => {
    const currentParcels = useUnloadingParcelsStore.getState().parcels;
    if (!currentParcels || currentParcels.length === 0) {
      setTableData(null);
      return;
    }
    setTableData([...currentParcels]); // 깊은 복사로 스냅샷 생성
  }, []);

  // 최초 데이터 준비 시 스냅샷 생성
  useEffect(() => {
    if (hasData && tableData === null) {
      createSnapshot();
    }
  }, [hasData, tableData, createSnapshot]);

  // 새로고침 핸들러: getState로 최신 데이터 가져와서 스냅샷 갱신
  const handleRefresh = useCallback(() => {
    createSnapshot(); // getState로 현재 zustand 데이터 가져와서 스냅샷 갱신
  }, [createSnapshot]);

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    // isCollecting이 true일 때만 systemContext 업데이트
    if (tableData && isCollecting) {
      // 상태별 통계 계산
      const statusStats: Record<string, number> = {};
      tableData.forEach((parcel) => {
        statusStats[parcel.status] = (statusStats[parcel.status] || 0) + 1;
      });

      // 운송가액 통계 계산
      const totalDeclaredValue = tableData.reduce(
        (sum, parcel) => sum + (parcel.declaredValue || 0),
        0
      );
      const avgDeclaredValue =
        tableData.length > 0 ? totalDeclaredValue / tableData.length : 0;

      // 처리된 운송장들 (하차 완료 또는 작업자 처리 완료)
      const processedParcels = tableData.filter(
        (parcel) =>
          parcel.status === "UNLOADED" ||
          parcel.status === "NORMAL" ||
          parcel.status === "ACCIDENT"
      );

      // 작업자별 처리 통계
      const workerStats: Record<string, number> = {};
      tableData.forEach((parcel) => {
        if (parcel.processedBy) {
          workerStats[parcel.processedBy] =
            (workerStats[parcel.processedBy] || 0) + 1;
        }
      });

      // 상태 한글 변환 함수
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

      const context = `현재 페이지: 실시간 운송장 현황 (/dashboard/realtime/waybill)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 전체 현황:
- 총 운송장 수: ${tableData.length}개
- 처리된 운송장: ${processedParcels.length}개
- 총 운송가액: ${totalDeclaredValue.toLocaleString()}원
- 평균 운송가액: ${avgDeclaredValue.toLocaleString()}원

⦁ 필터 조건:
- 검색어: ${globalFilter || "없음"}
- 상태 필터: ${statusFilter === "all" ? "전체" : getStatusLabel(statusFilter)}
- 현재 페이지: ${pageIndex + 1}
- 페이지당 표시: ${pageSize}개

⦁ 상태별 분포:
${Object.entries(statusStats)
  .map(([status, count]) => `- ${getStatusLabel(status)}: ${count}개`)
  .join("\n")}

⦁ 운송장 현황 테이블:

| 운송장 번호 | 상태 | 등록일시 | 하차일시 | 처리일시 | 처리 작업자 | 운송가액 |
|-------------|------|----------|----------|----------|-------------|----------|
${tableData
  .slice(0, 10)
  .map((parcel) => {
    const statusText = getStatusLabel(parcel.status);
    const createdAt = new Date(parcel.createdAt).toLocaleString("ko-KR");
    const unloadedAt = parcel.unloadedAt
      ? new Date(parcel.unloadedAt).toLocaleString("ko-KR")
      : "-";
    const processedAt = parcel.workerProcessedAt
      ? new Date(parcel.workerProcessedAt).toLocaleString("ko-KR")
      : "-";
    const processedBy = parcel.processedBy || "-";
    const declaredValue = parcel.declaredValue?.toLocaleString() || "0";

    return `| ${parcel.waybillId} | ${statusText} | ${createdAt} | ${unloadedAt} | ${processedAt} | ${processedBy} | ${declaredValue}원 |`;
  })
  .join("\n")}
${tableData.length > 10 ? `... 외 ${tableData.length - 10}개 운송장` : ""}

⦁ 작업자별 처리 현황:
${Object.entries(workerStats)
  .map(([worker, count]) => `- ${worker}: ${count}개 처리`)
  .join("\n")}

⦁ 사용자가 현재 보고 있는 정보:
- 운송장의 실시간 처리 현황과 상태를 상세히 확인할 수 있는 페이지
- 운송장 번호, 상태, 등록일시, 하차일시, 처리일시, 처리 작업자, 운송가액 정보 확인 가능
- 검색, 상태 필터, 페이지네이션으로 원하는 운송장 조회 가능
- 실시간으로 업데이트되는 운송장 현황과 통계 정보`;

      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [
    tableData,
    globalFilter,
    statusFilter,
    pageIndex,
    pageSize,
    setSystemContext,
    isCollecting,
    setIsMessagePending,
  ]);

  return (
    <div>
      <PageHeader />

      {!tableData ? (
        <LoadingSkeleton />
      ) : (
        <UnloadingTable parcels={tableData} onRefresh={handleRefresh} />
      )}

      <UnloadingInfo />
    </div>
  );
}
