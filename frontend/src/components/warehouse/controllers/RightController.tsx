import { ControllerLayout } from "@components/ui";
import {
  WorkerSpeedPanel,
  RealTimeStats,
  SystemInfoPanel,
} from "@components/warehouse/controllers/components";
import React from "react";

const RightController: React.FC = () => {
  return (
    <ControllerLayout>
      <WorkerSpeedPanel />
      <RealTimeStats />
      <SystemInfoPanel />
    </ControllerLayout>
  );
};

export default React.memo(RightController);
