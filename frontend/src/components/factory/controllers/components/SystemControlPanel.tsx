import React from "react";
import { ControlPanel, StatusIndicator } from "../../../ui";
import { useFactoryControls } from "@/hooks/useFactoryControls";

export const SystemControlPanel: React.FC = () => {
  const { isRunning, isPaused, startUnload, stopUnload, reset } =
    useFactoryControls();

  return (
    <ControlPanel title="시스템 제어">
      <StatusIndicator
        isRunning={isRunning}
        isPaused={isPaused}
        onStartUnload={startUnload}
        onStopUnload={stopUnload}
        onReset={reset}
      />
    </ControlPanel>
  );
};
