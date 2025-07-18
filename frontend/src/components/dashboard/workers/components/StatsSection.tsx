import React from "react";
import { StatsCard } from "@/components/dashboard/workers/components/StatsCard";
import type { WorkerStats } from "@/components/dashboard/workers/types";

interface StatsSectionProps {
  stats: WorkerStats;
}

/**
 * 작업자 통계 정보를 표시하는 섹션 컴포넌트
 */
export const StatsSection = React.memo<StatsSectionProps>(({ stats }) => (
  <div className="grid grid-cols-4 gap-4">
    <StatsCard title="전체 작업자" value={stats.totalWorkers} />
    <StatsCard
      title="작업중"
      value={stats.workingWorkers}
      color="text-green-600"
    />
    <StatsCard title="대기중" value={stats.idleWorkers} color="text-gray-600" />
    <StatsCard title="사고" value={stats.brokenWorkers} color="text-red-600" />
  </div>
));

StatsSection.displayName = "StatsSection";
