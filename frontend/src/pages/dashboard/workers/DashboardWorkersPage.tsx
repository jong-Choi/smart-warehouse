import { WorkersTable } from "@/components/dashboard/workers/WorkersTable";

export const DashboardWorkersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">작업자 관리</h1>
          <p className="text-muted-foreground">
            실시간으로 작업자들의 상태를 모니터링합니다.
          </p>
        </div>
      </div>

      <WorkersTable />
    </div>
  );
};
