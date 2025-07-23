import { ControlPanel, StatusIndicator } from "@components/ui";
import { useWarehouseControls } from "@/hooks/useWarehouseControls";

export const SystemControlPanel: React.FC = () => {
  const { isPaused, startUnload, stopUnload, reset } = useWarehouseControls();

  return (
    <ControlPanel title="시스템 제어">
      <StatusIndicator
        isPaused={isPaused}
        onStartUnload={startUnload}
        onStopUnload={stopUnload}
        onReset={reset}
      />
    </ControlPanel>
  );
};
