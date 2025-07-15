import React from "react";
import { useFactoryStore } from "../../../stores/factoryStore";
import { ControlPanel, FactorySlider, MetricCard } from "../../ui";
import {
  Truck,
  Activity,
  BarChart3,
  Clock,
  Package,
  Target,
} from "lucide-react";

const RightController: React.FC = () => {
  const {
    processingRate,
    maxProcessingRate,
    truckCount,
    maxTruckCount,
    workerCount,
    failCount,
    setProcessingRate,
    setTruckCount,
  } = useFactoryStore();

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
    <div className="w-80 space-y-4 bg-slate-700/50 p-4 rounded-lg">
      {/* 처리율 제어 */}
      <ControlPanel title="처리율 관리">
        <FactorySlider
          value={processingRate}
          min={0}
          max={maxProcessingRate}
          onChange={setProcessingRate}
          label="처리율"
          icon={<Activity className="w-4 h-4" />}
          tooltip="물건 처리 효율을 조절합니다 (0-100%)"
        />
      </ControlPanel>

      {/* 트럭 제어 */}
      <ControlPanel title="트럭 관리">
        <FactorySlider
          value={truckCount}
          min={1}
          max={maxTruckCount}
          onChange={setTruckCount}
          label="트럭 수"
          icon={<Truck className="w-4 h-4" />}
          tooltip="운송 트럭의 수를 조절합니다 (1-10대)"
        />
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
        <div className="text-sm space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span>시스템 상태:</span>
            <span className="text-green-600 font-medium">정상</span>
          </div>
          <div className="flex justify-between">
            <span>메모리 사용량:</span>
            <span className="font-medium">67%</span>
          </div>
          <div className="flex justify-between">
            <span>CPU 사용량:</span>
            <span className="font-medium">42%</span>
          </div>
          <div className="flex justify-between">
            <span>네트워크:</span>
            <span className="text-green-600 font-medium">연결됨</span>
          </div>
          <div className="flex justify-between">
            <span>작업자 수:</span>
            <span className="font-medium">{workerCount}명</span>
          </div>
          <div className="flex justify-between">
            <span>실패 건수:</span>
            <span className="font-medium text-red-600">{failCount}건</span>
          </div>
        </div>
      </ControlPanel>
    </div>
  );
};

export default RightController;
