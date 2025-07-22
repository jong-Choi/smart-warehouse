import {
  WaybillStats,
  WorkerStats,
  DashboardStats,
} from "@/components/dashboard/home/stats";
import { useDashboardHomeMessage } from "@components/dashboard/home/stats/hooks";

function DashboardHomePage() {
  const {
    setDashaboardStatsMessage,
    setWaybillStatsMessage,
    setWorkerStatsMessage,
    setWorkerTableMessage,
    isCollecting,
  } = useDashboardHomeMessage();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">실시간 개요</h1>
          <p className="text-muted-foreground">
            물류센터의 실시간 현황과 핵심 지표를 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* 대시보드 통계 카드들 */}
      <DashboardStats
        isCollecting={isCollecting}
        setDashaboardStatsMessage={setDashaboardStatsMessage}
      />

      {/* 통계 섹션 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 운송장 현황 통계 */}
        <WaybillStats
          isCollecting={isCollecting}
          setWaybillStatsMessage={setWaybillStatsMessage}
        />
        {/* 작업자 현황 통계 */}
        <WorkerStats
          isCollecting={isCollecting}
          setWorkerStatsMessage={setWorkerStatsMessage}
          setWorkerTableMessage={setWorkerTableMessage}
        />
      </div>
    </div>
  );
}

export default DashboardHomePage;
