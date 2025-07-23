import { MetricCard, WorkerGrid } from "@components/ui";
import { Users, Zap, Clock, AlertTriangle } from "lucide-react";
import { useWarehouseControls } from "@/hooks/useWarehouseControls";

export const ControlMetrics: React.FC = () => {
  const { workerCount, beltSpeed, unloadInterval, failCount } =
    useWarehouseControls();

  return (
    <WorkerGrid cols={2} gap={3}>
      <MetricCard
        title="작업자"
        value={workerCount}
        icon={<Users className="w-5 h-5" />}
        color="blue"
      />
      <MetricCard
        title="벨트 속도"
        value={`${beltSpeed}x`}
        icon={<Zap className="w-5 h-5" />}
        color="green"
      />
      <MetricCard
        title="하차 간격"
        value={`${unloadInterval}ms`}
        icon={<Clock className="w-5 h-5" />}
        color="orange"
      />
      <MetricCard
        title="작업 실패"
        value={failCount}
        icon={<AlertTriangle className="w-5 h-5" />}
        color="red"
      />
    </WorkerGrid>
  );
};
