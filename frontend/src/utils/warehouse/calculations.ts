import {
  MINIFIED_BELT_POINTS,
  SCALE_X,
  SCALE_Y,
  WIDTH,
  HEIGHT,
  WORKER_TOP_INDICES,
  WORKER_MID_INDICES,
  WORKER_OFFSET_Y,
  MAX_WORKERS,
  TRUCK_BASE,
  BELT_END_THRESHOLD_MARGIN,
} from "./constants";

// 이소메트릭 변환 함수
export const toIsometric = (x: number, y: number) => {
  return {
    x: x + y,
    y: (y - x) / 2,
  };
};

// 벨트 포인트 (화면 크기에 맞게 스케일링)
export const ORIGINAL_BELT_POINTS = MINIFIED_BELT_POINTS.map((point) => ({
  x: point.x * SCALE_X,
  y: point.y * SCALE_Y,
}));

// 이소메트릭 벨트 포인트 생성 및 중앙 정렬
export const BELT_POINTS = (() => {
  const rawPoints = ORIGINAL_BELT_POINTS.map(({ x, y }) => toIsometric(x, y));

  // 전체 영역 계산
  const minX = Math.min(...rawPoints.map((p) => p.x));
  const maxX = Math.max(...rawPoints.map((p) => p.x));
  const minY = Math.min(...rawPoints.map((p) => p.y));
  const maxY = Math.max(...rawPoints.map((p) => p.y));

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // 중앙 정렬을 위한 offset 계산
  const CENTER_OFFSET_X = (WIDTH - contentWidth) / 2 - minX;
  const CENTER_OFFSET_Y = (HEIGHT - contentHeight) / 2 - minY;

  return rawPoints.map((p) => ({
    x: p.x + CENTER_OFFSET_X,
    y: p.y + CENTER_OFFSET_Y,
  }));
})();

// 컨베이어 벨트 경로 (가로 위주 ┏━┓ 형태, 더 길게)
// 아래→오른쪽→위→왼쪽→중간→오른쪽 (ㄹ자 변형)
export const BELT_PATH = `M ${BELT_POINTS[0].x} ${BELT_POINTS[0].y} L ${BELT_POINTS[1].x} ${BELT_POINTS[1].y} L ${BELT_POINTS[2].x} ${BELT_POINTS[2].y} L ${BELT_POINTS[3].x} ${BELT_POINTS[3].y} L ${BELT_POINTS[4].x} ${BELT_POINTS[4].y} L ${BELT_POINTS[5].x} ${BELT_POINTS[5].y}`;

// 하차 트럭 위치 및 크기 (벨트 포인트에 상대적으로 계산)
export const TRUCK = (() => {
  // 벨트 시작점 (첫 번째 포인트) 기준으로 트럭 위치 계산
  const beltStartX = BELT_POINTS[0].x;
  const beltStartY = BELT_POINTS[0].y;

  // 트럭을 벨트 시작점 왼쪽에 배치
  const truckOffsetX = -420; // 벨트 시작점에서 왼쪽으로 420픽셀 (오른쪽으로 30px)
  const truckOffsetY = -170; // 벨트 시작점에서 위로 170픽셀 (위로 20px 더)

  return {
    x: beltStartX + truckOffsetX,
    y: beltStartY + truckOffsetY,
    width: TRUCK_BASE.width * SCALE_X,
    height: TRUCK_BASE.height * SCALE_Y,
  };
})();

// 작업자 위치 계산 함수
export function getWorkerPositionsOnBelt(workerCount: number) {
  const topCount = Math.max(0, workerCount - 10);
  const midCount = Math.min(10, workerCount);
  const selected: { x: number; y: number }[] = [];

  // 중간 10명(B) 먼저 균등 분포
  for (let i = 0; i < midCount; i++) {
    const t = i / (midCount || 1);
    const idxF = t * (WORKER_MID_INDICES.length - 1);
    const idx = Math.floor(idxF);
    const frac = idxF - idx;
    const p1 = BELT_POINTS[WORKER_MID_INDICES[idx]];
    const p2 = BELT_POINTS[WORKER_MID_INDICES[idx + 1]] || p1;

    // 벨트 방향 벡터 계산
    const beltVectorX = p2.x - p1.x;
    const beltVectorY = p2.y - p1.y;
    const beltLength = Math.sqrt(
      beltVectorX * beltVectorX + beltVectorY * beltVectorY
    );

    // 벨트에 수직인 방향 벡터 (시계방향 90도 회전)
    const perpVectorX = -beltVectorY / beltLength;
    const perpVectorY = beltVectorX / beltLength;

    // 작업자 위치 = 벨트 위의 위치 + 수직 방향 offset
    const workerX = p1.x + (p2.x - p1.x) * frac + perpVectorX * WORKER_OFFSET_Y;
    const workerY = p1.y + (p2.y - p1.y) * frac + perpVectorY * WORKER_OFFSET_Y;

    selected.push({
      x: workerX,
      y: workerY,
    });
  }

  // 위쪽 10명(A) 나중에 균등 분포
  for (let i = 0; i < topCount; i++) {
    const t = i / (topCount || 1);
    const idxF = t * (WORKER_TOP_INDICES.length - 1);
    const idx = Math.floor(idxF);
    const frac = idxF - idx;
    const p1 = BELT_POINTS[WORKER_TOP_INDICES[idx]];
    const p2 = BELT_POINTS[WORKER_TOP_INDICES[idx + 1]] || p1;

    // 벨트 방향 벡터 계산
    const beltVectorX = p2.x - p1.x;
    const beltVectorY = p2.y - p1.y;
    const beltLength = Math.sqrt(
      beltVectorX * beltVectorX + beltVectorY * beltVectorY
    );

    // 벨트에 수직인 방향 벡터 (반시계방향 90도 회전)
    const perpVectorX = beltVectorY / beltLength;
    const perpVectorY = -beltVectorX / beltLength;

    // 작업자 위치 = 벨트 위의 위치 + 수직 방향 offset
    const workerX = p1.x + (p2.x - p1.x) * frac + perpVectorX * WORKER_OFFSET_Y;
    const workerY = p1.y + (p2.y - p1.y) * frac + perpVectorY * WORKER_OFFSET_Y;

    selected.push({
      x: workerX,
      y: workerY,
    });
  }
  return selected;
}

// 작업자 위치: 위쪽(윗 가로) 10명, 중간(중간 가로) 10명으로 나눠서 배치
export const RECEIVE_WORKERS = getWorkerPositionsOnBelt(MAX_WORKERS);

// 하차 원(물건) 이동 애니메이션 (세그먼트별 거리에 따라 속도 조정)
export const TOTAL_DISTANCE = (() => {
  let distance = 0;
  for (let i = 0; i < BELT_POINTS.length - 1; i++) {
    const p1 = BELT_POINTS[i];
    const p2 = BELT_POINTS[i + 1];
    distance += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
  return distance;
})();

// 속도 계산을 위한 상수 (TOTAL_DISTANCE * 0.1)
export const SPEED_DENOMINATOR = TOTAL_DISTANCE * 0.1;

// 벨트 끝 도달 판정을 위한 상수
export const BELT_END_THRESHOLD = TOTAL_DISTANCE - BELT_END_THRESHOLD_MARGIN;

// 위치 계산 최적화 함수 (캐싱)
export const calculatePositionOnBelt = (() => {
  const cache = new Map<number, { x: number; y: number }>();

  return (progress: number) => {
    const cacheKey = Math.round(progress * 1000); // 소수점 3자리까지 캐시
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const targetDistance = progress * TOTAL_DISTANCE;
    let currentDistance = 0;
    let segIdx = 0;
    let t = 0;

    for (let i = 0; i < BELT_POINTS.length - 1; i++) {
      const p1 = BELT_POINTS[i];
      const p2 = BELT_POINTS[i + 1];
      const segmentDistance = Math.sqrt(
        (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
      );

      if (currentDistance + segmentDistance >= targetDistance) {
        segIdx = i;
        t = (targetDistance - currentDistance) / segmentDistance;
        break;
      }
      currentDistance += segmentDistance;
    }

    const p1 = BELT_POINTS[segIdx];
    const p2 = BELT_POINTS[segIdx + 1] || p1;
    const position = {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    };

    cache.set(cacheKey, position);
    return position;
  };
})();
