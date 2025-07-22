import {
  LoadingSkeleton,
  PageHeader,
} from "@/components/dashboard/home/waybills";
import { UnloadingTable } from "@components/dashboard/home/waybills/table/UnloadingTable";
import { UnloadingInfo } from "@components/dashboard/home/waybills/UnloadingInfo";
import { useDashboardWaybillMessage } from "@components/dashboard/home/waybills/hooks/useDashboardWaybillMessage";
import { useDashboardSnapshotData } from "@components/dashboard/home/waybills/hooks/useDashboardSnapshotData";

export default function DashboardUnloadingPage() {
  // 챗봇 메시지 훅
  const { setTableContextMessage, isCollecting } = useDashboardWaybillMessage();

  // 스냅샷 데이터 훅
  const { tableData, handleRefresh } = useDashboardSnapshotData();

  return (
    <div>
      <PageHeader />

      {!tableData ? (
        <LoadingSkeleton />
      ) : (
        <UnloadingTable
          parcels={tableData}
          onRefresh={handleRefresh}
          isCollecting={isCollecting}
          setTableContextMessage={setTableContextMessage}
        />
      )}
      <UnloadingInfo />
    </div>
  );
}
