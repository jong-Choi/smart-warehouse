import { ControlPanel, StatusIndicator } from "@/components/ui";
import { useFactoryControls } from "@/hooks/useFactoryControls";

export const SystemControlPanel: React.FC = () => {
  const { isPaused, startUnload, stopUnload, reset } = useFactoryControls();

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
