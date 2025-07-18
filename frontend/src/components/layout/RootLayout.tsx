import { Outlet, useLocation } from "react-router-dom";
import { TabSwitcher } from "@components/ui/TabSwitcher";
import FactoryBackground from "@/components/factory/FactoryBackground";
import { useUnloadingBroadcast } from "@/components/dashboard/unloading/hooks/useUnloadingBroadcast";
import { useWorkersBroadcast } from "@/components/dashboard/workers/hooks/useWorkersBroadcast";
import { useUnloadingParcels } from "@hooks/useWaybills";
import { useMemo } from "react";
import type { UnloadingParcel } from "@/components/dashboard/unloading/types";

function RootLayout() {
  const location = useLocation();
  const isFactory = location.pathname.startsWith("/factory");
  // const isDashboard = location.pathname.startsWith("/dashboard");

  // 전역 parcels 데이터 관리
  const { data: parcelsData } = useUnloadingParcels();

  // Parcel을 UnloadingParcel로 변환
  const initialParcels: UnloadingParcel[] = useMemo(() => {
    if (!parcelsData?.parcels) return [];

    return parcelsData.parcels.map((parcel) => ({
      ...parcel,
      createdAt: parcel.processedAt, // processedAt을 createdAt으로 사용
      updatedAt: parcel.processedAt, // processedAt을 updatedAt으로 사용
    }));
  }, [parcelsData]);

  // 브로드캐스트를 통한 실시간 상태 업데이트 (전역에서 실행)
  useUnloadingBroadcast(initialParcels);

  // 작업자 브로드캐스트 수신 (전역에서 실행)
  useWorkersBroadcast();

  return (
    <div>
      <div
        className={`h-screen flex flex-col  ${
          isFactory
            ? "bg-slate-200 duration-700 transition-colors "
            : "bg-white"
        }`}
      >
        <TabSwitcher />
        {/* Factory 백그라운드 - 공장일 때만 표시 */}
        <FactoryBackground />
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
