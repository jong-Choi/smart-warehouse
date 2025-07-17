// 미니어처 벨트 포인트 (기준 좌표)
export const MINIFIED_BELT_POINTS = [
  // 아래쪽 (좌→우)
  { x: 180, y: 345 },
  { x: 540, y: 345 },
  // 위로 (우→중간)
  { x: 540, y: 195 },
  // 왼쪽 (우→좌, 중간)
  { x: 120, y: 195 },
  // 위로 (중간→위)
  { x: 120, y: 45 }, // 95에서 45로 변경 (더 위로)
  // 오른쪽 (좌→우, 위)
  { x: 540, y: 45 }, // 95에서 45로 변경 (더 위로)
];

// 기준 크기 상수
export const BASE_WIDTH = 900;
export const BASE_HEIGHT = 600;

// 작업자 관련 상수
export const MAX_WORKERS = 20;
export const WORKER_TOP_INDICES = [4, 5]; // 위쪽 가로선 (120,45) -> (540,45)
export const WORKER_MID_INDICES = [2, 3]; // 중간 가로선 (540,195) -> (120,195)
export const WORKER_OFFSET_Y = 50; // 28에서 50으로 증가하여 레일에서 더 멀리 배치

// 작업자 물건 처리 범위
export const WORKER_CATCH_RANGE = 60; // 30에서 60으로 증가하여 더 넓은 범위에서 물건 처리
export const WORKER_CATCH_RANGE_SQUARED =
  WORKER_CATCH_RANGE * WORKER_CATCH_RANGE; // 제곱값 미리 계산

// 하차 관련 상수
export const TRUCK_BASE = { x: 100, y: 315, width: 400, height: 400 };

export const BELT_WORKER_STYLE = {
  fill: "#a5d6a7",
  stroke: "#388e3c",
  strokeWidth: 2,
};

// 작업자 UI 오프셋 상수
export const WORKER_UI_OFFSET = { x: -15, y: 45 };

// 화면 크기 상수
export const WIDTH = 1200;
export const HEIGHT = 800;

// 스케일 계산 상수
export const SCALE_X = WIDTH / BASE_WIDTH;
export const SCALE_Y = HEIGHT / BASE_HEIGHT;

// 벨트 끝 도달 판정을 위한 상수
export const BELT_END_THRESHOLD_MARGIN = 10; // 10픽셀 여유

// 작업자별 쿨다운 배율 (0.6~1.4, 마운트 시 고정)
export const WORKER_COOLDOWN_SCALES = Array(MAX_WORKERS)
  .fill(0)
  .map(() => Math.random() * 0.8 + 0.6);

// 고장 관련 상수
export const WORKER_BROKEN_DURATION = 15000; // 15초
export const WORKER_BROKEN_PROBABILITY = 0.05; // 5% 확률
export const WORKER_BROKEN_THRESHOLD = 2; // 끝 두자리 차이가 2 이하일 때

// 초기 운송장 번호
