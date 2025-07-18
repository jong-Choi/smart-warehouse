import { WorkersTable } from "@/components/dashboard/workers/WorkersTable";

export const DashboardWorkersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            실시간 작업자 현황
          </h1>
          <p className="text-muted-foreground">
            작업자들의 실시간 상태와 성과를 모니터링합니다.
          </p>
        </div>
      </div>

      <WorkersTable />
    </div>
  );
};
