import { useMemo } from "react";
import { useWarehouseStore } from "@/stores/warehouseStore";
import truckSvg from "@assets/svg/truck.svg";
import { WIDTH, HEIGHT } from "@/utils/warehouse/constants";
import {
  BELT_PATH,
  TRUCK,
  RECEIVE_WORKERS,
} from "@/utils/warehouse/calculations";
import { useWarehouse2D } from "@/hooks/warehouse/useWarehouse2D";
import {
  MovingBox,
  Worker,
  BeltLines,
} from "@/components/warehouse/warehouse2d/components";

export default function Warehouse2D() {
  // warehouseStore에서 상태 가져오기
  const { workerCount, workerCooldown } = useWarehouseStore([
    "workerCount",
    "workerCooldown",
  ]);

  // 커스텀 훅에서 상태 가져오기
  const { loadedParcels, workerCatchTimes, workerBrokenUntil } =
    useWarehouse2D();

  // Worker 컴포넌트들
  const workerComponents = useMemo(
    () =>
      Array.from({ length: workerCount }).map((_, i) => (
        <Worker
          key={i}
          index={i}
          position={RECEIVE_WORKERS[i]}
          catchTimes={workerCatchTimes[i]}
          brokenUntil={workerBrokenUntil[i]}
          workerCooldown={workerCooldown}
        />
      )),
    [workerCount, workerCatchTimes, workerBrokenUntil, workerCooldown]
  );

  // MovingBox 컴포넌트들을 메모이제이션
  const movingBoxComponents = useMemo(() => {
    return loadedParcels.map((loadedParcel, i) => (
      <MovingBox key={i} loadedParcel={loadedParcel} />
    ));
  }, [loadedParcels]);

  return (
    <div
      style={{
        width: WIDTH,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* svg와 버튼을 감싸는 div */}
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          margin: "0 auto",
        }}
      >
        {/* SVG 시각화 */}
        <svg
          width={WIDTH}
          height={900}
          style={{
            background: "transparent",
            borderRadius: 16,
          }}
        >
          {/* 그림자 필터 정의 */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="4"
                dy="2"
                stdDeviation="2"
                floodColor="#000000"
                floodOpacity="0.4"
              />
            </filter>
          </defs>

          {/* 컨베이어 벨트 배경 (넓고 반투명한 회색) */}
          <path
            d={BELT_PATH}
            stroke="#999"
            strokeWidth={35}
            fill="none"
            opacity={0.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
          />

          {/* 컨베이어 벨트 어두운 회색 가로줄들 */}
          <BeltLines />

          {/* 이동하는 박스(물건, 여러 개) - 메모이제이션된 컴포넌트 */}
          {movingBoxComponents}

          {/* 벨트 작업자 */}
          {workerComponents}

          {/* 하차 트럭 (가장 앞에 표시) */}
          <image
            x={TRUCK.x}
            y={TRUCK.y}
            width={TRUCK.width}
            height={TRUCK.height}
            href={truckSvg}
          />
        </svg>
      </div>
    </div>
  );
}
