import { useWarehouseStore } from "@/stores/warehouseStore";
import { ControlPanel, WorkerCard, WorkerGrid } from "@components/ui";

export const WorkerSpeedPanel: React.FC = () => {
  const { workerCount, workerSpeeds } = useWarehouseStore([
    "workerCount",
    "workerSpeeds",
  ]);

  return (
    <ControlPanel title="작업자별 작업속도">
      <div className="h-32 overflow-y-auto">
        <WorkerGrid cols={3} gap={1}>
          {workerSpeeds.slice(0, workerCount).map((speed, i) => {
            const isTop = i < 10;
            const label = isTop ? `A${i + 1}` : `B${i - 9}`;
            return <WorkerCard key={i} label={label} value={`${speed}ms`} />;
          })}
        </WorkerGrid>
      </div>
    </ControlPanel>
  );
};
