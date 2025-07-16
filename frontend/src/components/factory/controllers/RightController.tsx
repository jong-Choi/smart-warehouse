import React from "react";
import { useFactoryStore } from "../../../stores/factoryStore";
import {
  ControlPanel,
  MetricCard,
  ControllerLayout,
  WorkerCard,
  WorkerGrid,
  SystemInfoContainer,
  SystemInfoRow,
} from "../../ui";
import { BarChart3, Clock, Package, Target } from "lucide-react";

const RightController: React.FC = () => {
  const { workerCount, failCount, workerSpeeds } = useFactoryStore();

  // 실시간 통계 계산
  const stats = {
    totalProcessed: workerCount * 10 + Math.floor(Math.random() * 50), // 더미 데이터
    todayProcessed: Math.floor(Math.random() * 20) + 5,
    averageTime: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(
      Math.random() * 9
    )}분`,
    efficiency: `${Math.floor(Math.random() * 10) + 90}%`,
  };

  return (
    <ControllerLayout>
      {/* 작업자별 작업속도 */}
      <ControlPanel title="작업자별 작업속도">
        <div className="h-48 overflow-y-auto">
          <WorkerGrid cols={3} gap={1}>
            {workerSpeeds.slice(0, workerCount).map((speed, i) => {
              const isTop = i < 10;
              const label = isTop ? `A${i + 1}` : `B${i - 9}`;
              return <WorkerCard key={i} label={label} value={`${speed}ms`} />;
            })}
          </WorkerGrid>
        </div>
      </ControlPanel>

      {/* 실시간 통계 */}
      <ControlPanel title="실시간 통계">
        <div className="space-y-3">
          <MetricCard
            title="총 처리량"
            value={stats.totalProcessed}
            icon={<Package className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="오늘 처리량"
            value={stats.todayProcessed}
            icon={<BarChart3 className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="평균 처리시간"
            value={stats.averageTime}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
          <MetricCard
            title="효율성"
            value={stats.efficiency}
            icon={<Target className="w-5 h-5" />}
            color="red"
          />
        </div>
      </ControlPanel>

      {/* 시스템 정보 */}
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
    </ControllerLayout>
  );
};

export default RightController;
