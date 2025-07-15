import React from "react";
import closedBoxSvg from "@assets/svg/closed-box.svg";
import { calculatePositionOnBelt } from "@/utils/warehouse/calculations";

interface MovingBoxProps {
  circle: { progress: number; id: number };
}

// 이동하는 박스 컴포넌트 (메모이제이션)
export const MovingBox = React.memo(({ circle }: MovingBoxProps) => {
  const movingBox = calculatePositionOnBelt(circle.progress);

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
});
