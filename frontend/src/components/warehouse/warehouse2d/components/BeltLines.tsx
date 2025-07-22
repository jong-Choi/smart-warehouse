import React from "react";
import {
  BELT_POINTS,
  TOTAL_DISTANCE,
  ORIGINAL_BELT_POINTS,
  toIsometric,
} from "@/utils/warehouse/calculations";

export const BeltLines = React.memo(() => {
  const lines = [];
  const numLines = 80; // 가로선 개수를 40에서 80으로 증가 (더 조밀하게)

  for (let i = 0; i < numLines; i++) {
    const t = i / (numLines - 1);
    const targetDistance = t * TOTAL_DISTANCE;

    // 컨베이어 끝 부분에서 가로줄 제거 (처음 2%와 마지막 2% 제외)
    if (t < 0.01 || t > 0.99) continue;

    let currentDistance = 0;
    let segIdx = 0;
    let t_seg = 0;

    // 벨트 위의 위치 찾기
    for (let j = 0; j < BELT_POINTS.length - 1; j++) {
      const p1 = BELT_POINTS[j];
      const p2 = BELT_POINTS[j + 1];
      const segmentDistance = Math.sqrt(
        (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
      );

      if (currentDistance + segmentDistance >= targetDistance) {
        segIdx = j;
        t_seg = (targetDistance - currentDistance) / segmentDistance;
        break;
      }
      currentDistance += segmentDistance;
    }

    const p1 = BELT_POINTS[segIdx];
    const p2 = BELT_POINTS[segIdx + 1] || p1;
    const centerX = p1.x + (p2.x - p1.x) * t_seg;
    const centerY = p1.y + (p2.y - p1.y) * t_seg;

    // 원본 좌표계에서 벨트 방향 계산 (toIsometric 역변환)
    const originalP1 = ORIGINAL_BELT_POINTS[segIdx];
    const originalP2 = ORIGINAL_BELT_POINTS[segIdx + 1] || originalP1;
    const originalBeltVectorX = originalP2.x - originalP1.x;
    const originalBeltVectorY = originalP2.y - originalP1.y;

    // 이소메트릭 변환을 통해 정확한 수직 방향 계산
    const perpOriginalX = -originalBeltVectorY;
    const perpOriginalY = originalBeltVectorX;
    const perpOriginalLength = Math.sqrt(
      perpOriginalX * perpOriginalX + perpOriginalY * perpOriginalY
    );

    // 정규화된 수직 벡터를 이소메트릭 변환
    const normalizedPerpX = perpOriginalX / perpOriginalLength;
    const normalizedPerpY = perpOriginalY / perpOriginalLength;
    const isometricPerp = toIsometric(normalizedPerpX, normalizedPerpY);

    // 가로선의 시작점과 끝점
    const lineLength = 35; // 벨트 너비만큼
    const startX = centerX + (isometricPerp.x * lineLength) / 2;
    const startY = centerY + (isometricPerp.y * lineLength) / 2;
    const endX = centerX - (isometricPerp.x * lineLength) / 2;
    const endY = centerY - (isometricPerp.y * lineLength) / 2;

    lines.push(
      <line
        key={i}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#777"
        strokeWidth={2}
        opacity={0.4}
      />
    );
  }

  return <>{lines}</>;
});
