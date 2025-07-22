import { ControllerLayout } from "@/components/ui";
import {
  WorkerSpeedPanel,
  RealTimeStats,
  SystemInfoPanel,
} from "@/components/warehouse/controllers/components";

const RightController: React.FC = () => {
  return (
    <ControllerLayout>
      <WorkerSpeedPanel />
      <RealTimeStats />
      <SystemInfoPanel />
    </ControllerLayout>
  );
};

export default RightController;
