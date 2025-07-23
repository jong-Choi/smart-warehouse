import { WorkersTable } from "@components/dashboard/home/workers/WorkersTable";
import { useDashboardWorkerMessage } from "@components/dashboard/home/workers/hooks";
import { SectionHeader, PageLayout } from "@components/ui";

export const DashboardWorkersPage: React.FC = () => {
  // 챗봇 관련 훅
  const { setTableContextMessage, isCollecting } = useDashboardWorkerMessage();

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="실시간 작업자 현황"
          description="작업자들의 실시간 상태와 성과를 모니터링합니다."
        />
      </div>

      <WorkersTable
        setTableContextMessage={setTableContextMessage}
        isCollecting={isCollecting}
      />
    </PageLayout>
  );
};
