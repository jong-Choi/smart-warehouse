import { ControlPanel, MetricCard } from "@/components/ui";
import { BarChart3, Clock, Package, Target } from "lucide-react";
import { useFactoryStats } from "@/hooks/useFactoryStats";

export const RealTimeStats: React.FC = () => {
  const stats = useFactoryStats();

  return (
    <ControlPanel title="실시간 통계">
      <div className="space-y-3">
        <MetricCard
          title="하차 예정수량"
          value={stats.isLoading ? "로딩중..." : stats.unloadExpected}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="하차 완료 수량"
          value={stats.isLoading ? "0" : stats.unloadCompleted}
          icon={<BarChart3 className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="처리된 갯수"
          value={stats.isLoading ? "0" : stats.processedCount}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <MetricCard
          title="사고율"
          value={stats.isLoading ? "0.00%" : stats.accidentRate}
          icon={<Target className="w-5 h-5" />}
          color="red"
        />
      </div>
    </ControlPanel>
  );
};
