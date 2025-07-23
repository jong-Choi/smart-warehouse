import { Outlet, useLocation } from "react-router-dom";
import { TabSwitcher } from "@components/ui/TabSwitcher";
import WarehouseBackground from "@components/warehouse/WarehouseBackground";
import { useUnloadingBroadcast } from "@hooks/useUnloadingBroadcast";
import { useWorkersBroadcast } from "@hooks/useWorkersBroadcast";
import { useUnloadingParcels } from "@hooks/useWaybills";
import { useMemo } from "react";
import type { UnloadingParcel } from "@components/dashboard/home/waybills/types";

function RootLayout() {
  const location = useLocation();
  const isWarehouse = location.pathname.startsWith("/warehouse");
  // const isDashboard = location.pathname.startsWith("/dashboard");

  // 전역 parcels 데이터 관리
  const { data: parcelsData } = useUnloadingParcels();

  // Parcel을 UnloadingParcel로 변환
  const initialParcels: UnloadingParcel[] = useMemo(() => {
    if (!parcelsData?.parcels) return [];

    return parcelsData.parcels.map((parcel) => ({
      ...parcel,
      // API에서 가져온 데이터의 status를 그대로 사용
      // createdAt은 이미 parcel에 포함되어 있음
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
          isWarehouse
            ? "bg-slate-200 duration-700 transition-colors "
            : "bg-white"
        }`}
      >
        <TabSwitcher />
        {/* Warehouse 백그라운드 - 창고일 때만 표시 */}
        <WarehouseBackground />
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
