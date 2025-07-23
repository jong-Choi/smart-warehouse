import { ControlPanel, WarehouseSlider } from "@components/ui";
import { Users, Zap, Clock, Activity } from "lucide-react";
import { useWarehouseControls } from "@/hooks/useWarehouseControls";

export const ControlSliders: React.FC = () => {
  const {
    workerCount,
    maxWorkers,
    beltSpeed,
    maxBeltSpeed,
    unloadInterval,
    workerCooldown,
    setWorkerCount,
    setBeltSpeed,
    setUnloadInterval,
    setWorkerCooldown,
  } = useWarehouseControls();

  return (
    <>
      {/* 작업자 제어 */}
      <ControlPanel title="작업자 관리">
        <WarehouseSlider
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
        <WarehouseSlider
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
        <WarehouseSlider
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
        <WarehouseSlider
          value={workerCooldown}
          min={1000}
          max={10000}
          onChange={setWorkerCooldown}
          label="작업 쿨다운"
          icon={<Activity className="w-4 h-4" />}
          tooltip="작업자의 작업 쿨다운을 조절합니다 (1000-10000ms)"
        />
      </ControlPanel>
    </>
  );
};
