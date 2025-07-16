import React from "react";
import { ControlPanel, StatusIndicator } from "../../../ui";
import { useFactoryControls } from "@/hooks/useFactoryControls";

export const SystemControlPanel: React.FC = () => {
  const { isRunning, toggleRunning, reset } = useFactoryControls();

  return (
    <ControlPanel title="시스템 제어">
      <StatusIndicator
        isRunning={isRunning}
        onToggleRunning={toggleRunning}
        onReset={reset}
      />
    </ControlPanel>
  );
};
