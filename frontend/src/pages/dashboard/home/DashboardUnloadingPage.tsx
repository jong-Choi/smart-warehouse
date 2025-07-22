import { useState, useEffect, useCallback } from "react";

import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import { useUnloadingTableStore } from "@/stores/unloadingTableStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import type { UnloadingParcel } from "@components/dashboard/home/waybills/types";
import {
  LoadingSkeleton,
  PageHeader,
} from "@/components/dashboard/home/waybills";
import { UnloadingTable } from "@components/dashboard/home/waybills/table/UnloadingTable";
import { UnloadingInfo } from "@components/dashboard/home/waybills/UnloadingInfo";

export default function DashboardUnloadingPage() {
  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  // 데이터 존재 여부만 구독 (parcels 배열 자체는 구독하지 않음)
  const hasData = useUnloadingParcelsStore(
    (state) => state.parcels && state.parcels.length > 0
  );

  // 테이블 상태 가져오기
  const { pageIndex, pageSize, globalFilter, statusFilter } =
    useUnloadingTableStore([
      "pageIndex",
      "pageSize",
      "globalFilter",
      "statusFilter",
    ]);

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
