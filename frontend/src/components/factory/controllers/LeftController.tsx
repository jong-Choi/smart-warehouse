import React from "react";
import { ControllerLayout } from "../../ui";
import {
  SystemControlPanel,
  ControlMetrics,
  ControlSliders,
} from "./components";

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
