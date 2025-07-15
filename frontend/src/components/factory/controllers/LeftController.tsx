import React from "react";
import { useFactoryStore } from "../../../stores/factoryStore";
import {
  ControlPanel,
  FactorySlider,
  StatusIndicator,
  MetricCard,
} from "../../ui";
import { Users, Zap, Activity, Clock, AlertTriangle } from "lucide-react";

const LeftController: React.FC = () => {
  const {
    workerCount,
    maxWorkers,
    beltSpeed,
    maxBeltSpeed,
    isRunning,
    isPaused,
    unloadInterval,
    workerCooldown,
    failCount,
    setWorkerCount,
    setBeltSpeed,
    setUnloadInterval,
    setWorkerCooldown,
    toggleRunning,
    togglePaused,
    reset,
  } = useFactoryStore();

  return (
    <div className="w-80 space-y-4 bg-slate-700/50 p-4 rounded-lg">
      {/* 상태 표시 */}
      <ControlPanel title="시스템 제어">
        <StatusIndicator
          isRunning={isRunning}
          isPaused={isPaused}
          onToggleRunning={toggleRunning}
          onTogglePaused={togglePaused}
          onReset={reset}
        />
      </ControlPanel>

      {/* 메트릭 카드들 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="작업자"
          value={workerCount}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="벨트 속도"
          value={`${beltSpeed}x`}
          icon={<Zap className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="하차 간격"
          value={`${unloadInterval}ms`}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <MetricCard
          title="작업 실패"
          value={failCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* 작업자 제어 */}
      <ControlPanel title="작업자 관리">
        <FactorySlider
          value={workerCount}
          min={1}
          max={maxWorkers}
          onChange={setWorkerCount}
          label="작업자 수"
          icon={<Users className="w-4 h-4" />}
          tooltip="작업장의 작업자 수를 조절합니다 (1-20명)"
        />
      </ControlPanel>

      {/* 벨트 속도 제어 */}
      <ControlPanel title="벨트 속도">
        <FactorySlider
          value={beltSpeed}
          min={1}
          max={maxBeltSpeed}
          onChange={setBeltSpeed}
          label="벨트 속도"
          icon={<Zap className="w-4 h-4" />}
          tooltip="컨베이어 벨트의 속도를 조절합니다 (1-5x)"
        />
      </ControlPanel>

      {/* 하차 간격 제어 */}
      <ControlPanel title="하차 관리">
        <FactorySlider
          value={unloadInterval}
          min={500}
          max={5000}
          onChange={setUnloadInterval}
          label="하차 간격"
          icon={<Clock className="w-4 h-4" />}
          tooltip="물건 하차 간격을 조절합니다 (500-5000ms)"
        />
      </ControlPanel>

      {/* 작업자 쿨다운 제어 */}
      <ControlPanel title="작업 속도">
        <FactorySlider
          value={workerCooldown}
          min={1000}
          max={10000}
          onChange={setWorkerCooldown}
          label="작업 쿨다운"
          icon={<Activity className="w-4 h-4" />}
          tooltip="작업자의 작업 쿨다운을 조절합니다 (1000-10000ms)"
        />
      </ControlPanel>
    </div>
  );
};

export default LeftController;
