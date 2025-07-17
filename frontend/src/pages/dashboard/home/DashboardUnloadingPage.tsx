import React, { useMemo } from "react";
import { useUnloadingParcels } from "../../../hooks/useWaybills";
import {
  UnloadingTable,
  UnloadingInfo,
  useUnloadingBroadcast,
  type UnloadingParcel,
} from "../../../components/dashboard/unloading";

export default function DashboardUnloadingPage() {
  const { data: parcelsData, isLoading, refetch } = useUnloadingParcels();

  // Parcel을 UnloadingParcel로 변환
  const initialParcels: UnloadingParcel[] = useMemo(() => {
    if (!parcelsData?.parcels) return [];

    return parcelsData.parcels.map((parcel) => ({
      ...parcel,
      createdAt: parcel.processedAt, // processedAt을 createdAt으로 사용
      updatedAt: parcel.processedAt, // processedAt을 updatedAt으로 사용
    }));
  }, [parcelsData]);

  // 브로드캐스트를 통한 실시간 상태 업데이트
  const parcels = useUnloadingBroadcast(initialParcels);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">하차 예정 운송장</h1>
          <p className="text-muted-foreground">
            하차 대기 중인 운송장 목록을 실시간으로 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
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

      <UnloadingTable parcels={parcels} onRefresh={refetch} />
      <UnloadingInfo />
    </div>
  );
}
