import { ControllerLayout } from "@/components/ui";
import {
  SystemControlPanel,
  ControlMetrics,
  ControlSliders,
} from "@/components/factory/controllers/components";

const LeftController: React.FC = () => {
  return (
    <ControllerLayout>
      <SystemControlPanel />
      <ControlMetrics />
      <ControlSliders />
    </ControllerLayout>
  );
};

export default LeftController;
