import React from "react";
import { Stat } from "@components/ui";
import type { WorkerStats } from "@components/dashboard/home/workers/types";

interface StatsSectionProps {
  stats: WorkerStats;
}

/**
 * 작업자 통계 정보를 표시하는 섹션 컴포넌트
 */
export const StatsSection = React.memo<StatsSectionProps>(({ stats }) => (
  <Stat.Container className="p-6">
    <Stat.Grid cols={4}>
      <Stat.Card
        title="전체 작업자"
        value={stats.totalWorkers}
        variant="default"
      />
      <Stat.Card title="작업중" value={stats.workingWorkers} variant="green" />
      <Stat.Card title="대기중" value={stats.idleWorkers} variant="yellow" />
      <Stat.Card title="사고" value={stats.brokenWorkers} variant="red" />
    </Stat.Grid>
  </Stat.Container>
));

StatsSection.displayName = "StatsSection";
