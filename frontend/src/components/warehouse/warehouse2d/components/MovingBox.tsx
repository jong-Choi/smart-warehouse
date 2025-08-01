import closedBoxSvg from "@assets/svg/closed-box.svg";
import { calculatePositionOnBelt } from "@/utils/warehouse/calculations";
import { _useWarehouseStore } from "@stores/warehouseStore";

interface MovingBoxProps {
  loadedParcelId: number | string;
}

// 이동하는 박스 컴포넌트 (메모이제이션)
export const MovingBox = ({ loadedParcelId }: MovingBoxProps) => {
  const progress = _useWarehouseStore(
    (s) => s.getLoadedParcelById(loadedParcelId)?.progress
  );
  const movingBox = calculatePositionOnBelt(progress || 0);

  return (
    <g
      transform={`translate(${movingBox.x - 20}, ${movingBox.y - 28})`}
      style={{
        willChange: "transform",
      }}
    >
      <image href={closedBoxSvg} x={0} y={0} width={40} height={40} />
    </g>
  );
};
