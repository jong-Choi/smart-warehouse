import React from "react";
import { useFactoryStore } from "@/stores/factoryStore";
import { ControlPanel, SystemInfoContainer, SystemInfoRow } from "../../../ui";

export const SystemInfoPanel: React.FC = () => {
  const { workerCount, failCount } = useFactoryStore();

  return (
    <ControlPanel title="시스템 정보">
      <SystemInfoContainer>
        <SystemInfoRow label="시스템 상태" value="정상" valueColor="green" />
        <SystemInfoRow label="메모리 사용량" value="67%" />
        <SystemInfoRow label="CPU 사용량" value="42%" />
        <SystemInfoRow label="네트워크" value="연결됨" valueColor="green" />
        <SystemInfoRow label="작업자 수" value={`${workerCount}명`} />
        <SystemInfoRow
          label="실패 건수"
          value={`${failCount}건`}
          valueColor="red"
        />
      </SystemInfoContainer>
    </ControlPanel>
  );
};
