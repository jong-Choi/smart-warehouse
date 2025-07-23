import {
  WaybillStats,
  WorkerStats,
  DashboardStats,
} from "@components/dashboard/home/stats";
import { useDashboardHomeMessage } from "@components/dashboard/home/stats/hooks";
import { SectionHeader, PageLayout } from "@components/ui";

function DashboardHomePage() {
  const {
    setDashaboardStatsMessage,
    setWaybillStatsMessage,
    setWorkerStatsMessage,
    setWorkerTableMessage,
    isCollecting,
  } = useDashboardHomeMessage();

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="실시간 개요"
          description="물류센터의 실시간 현황과 핵심 지표를 한눈에 확인하세요."
        />
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
    </PageLayout>
  );
}

export default DashboardHomePage;
