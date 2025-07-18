import { useState, useEffect, useCallback } from "react";
import {
  UnloadingTable,
  UnloadingInfo,
} from "@/components/dashboard/unloading";
import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
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
  // 데이터 존재 여부만 구독 (parcels 배열 자체는 구독하지 않음)
  const hasData = useUnloadingParcelsStore(
    (state) => state.parcels && state.parcels.length > 0
  );

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

  return (
    <div className="p-6">
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
