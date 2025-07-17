import React, { useState, useEffect, useCallback } from "react";
import {
  UnloadingTable,
  UnloadingInfo,
} from "../../../components/dashboard/unloading";
import { useUnloadingParcelsStore } from "../../../stores/unloadingParcelsStore";
import type { UnloadingParcel } from "../../../components/dashboard/unloading/types";

// 로딩 스켈레톤 컴포넌트
const LoadingSkeleton = () => (
  <div className="bg-card rounded-lg border p-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function DashboardUnloadingPage() {
  const { parcels } = useUnloadingParcelsStore();

  // 스냅샷 상태 관리
  const [tableData, setTableData] = useState<UnloadingParcel[] | null>(null);

  // 스냅샷 생성 함수
  const createSnapshot = useCallback(() => {
    if (!parcels || parcels.length === 0) {
      setTableData(null);
      return;
    }
    setTableData([...parcels]); // 깊은 복사로 스냅샷 생성
  }, [parcels]);

  // 최초 데이터 준비 시 스냅샷 생성
  useEffect(() => {
    if (parcels && tableData === null) {
      createSnapshot();
    }
  }, [parcels, tableData, createSnapshot]);

  // 새로고침 핸들러: zustand의 최신 데이터로 스냅샷 갱신
  const handleRefresh = useCallback(() => {
    createSnapshot(); // 현재 zustand 데이터로 스냅샷만 갱신
  }, [createSnapshot]);

  // 데이터가 없으면 로딩 화면 표시
  if (!tableData) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">하차 예정 운송장</h1>
          <p className="text-muted-foreground">
            하차 대기 중인 운송장 목록을 실시간으로 확인할 수 있습니다.
          </p>
        </div>
        <LoadingSkeleton />
        <UnloadingInfo />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">하차 예정 운송장</h1>
        <p className="text-muted-foreground">
          하차 대기 중인 운송장 목록을 실시간으로 확인할 수 있습니다.
        </p>
      </div>

      <UnloadingTable parcels={tableData} onRefresh={handleRefresh} />
      <UnloadingInfo />
    </div>
  );
}
