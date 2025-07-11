import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "./App";

// 창고 2D 시각화: ㄷ자 컨베이어, 하차지점, 작업자들
const boxColor = "#ffb300";

// 미니어처 벨트 포인트 (기준 좌표)
const MINIFIED_BELT_POINTS = [
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

// 이소메트릭 변환 함수
const toIsometric = (x: number, y: number) => {
  return {
    x: x + y,
    y: (y - x) / 2,
  };
};

// 기준 크기 상수
const BASE_WIDTH = 900;
const BASE_HEIGHT = 600;

// 작업자 관련 상수
const MAX_WORKERS = 20;
const WORKER_TOP_INDICES = [4, 5]; // 위쪽 가로선 (120,45) -> (540,45)
const WORKER_MID_INDICES = [2, 3]; // 중간 가로선 (540,195) -> (120,195)
const WORKER_OFFSET_Y = 50; // 28에서 50으로 증가하여 레일에서 더 멀리 배치

// 작업자 물건 처리 범위
const WORKER_CATCH_RANGE = 60; // 30에서 60으로 증가하여 더 넓은 범위에서 물건 처리

// 하차 관련 상수
const TRUCK_BASE = { x: 100, y: 315, width: 60, height: 60 };
const UNLOAD_WORKER_OFFSET = { x: 20, y: 32 };

// 작업자 스타일 상수
const UNLOAD_WORKER_STYLE = {
  fill: "#1976d2",
  stroke: "#0d47a1",
  strokeWidth: 4,
};

const BELT_WORKER_STYLE = {
  fill: "#a5d6a7",
  stroke: "#388e3c",
  strokeWidth: 2,
};

// 화면 크기 상수
const WIDTH = 1200;
const HEIGHT = 800;

// 스케일 계산 상수
const SCALE_X = WIDTH / BASE_WIDTH;
const SCALE_Y = HEIGHT / BASE_HEIGHT;

// 벨트 포인트 (화면 크기에 맞게 스케일링)
const ORIGINAL_BELT_POINTS = MINIFIED_BELT_POINTS.map((point) => ({
  x: point.x * SCALE_X,
  y: point.y * SCALE_Y,
}));

// 이소메트릭 벨트 포인트 생성 및 중앙 정렬
const BELT_POINTS = (() => {
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
const BELT_PATH = `M ${BELT_POINTS[0].x} ${BELT_POINTS[0].y} L ${BELT_POINTS[1].x} ${BELT_POINTS[1].y} L ${BELT_POINTS[2].x} ${BELT_POINTS[2].y} L ${BELT_POINTS[3].x} ${BELT_POINTS[3].y} L ${BELT_POINTS[4].x} ${BELT_POINTS[4].y} L ${BELT_POINTS[5].x} ${BELT_POINTS[5].y}`;

// 하차 트럭 위치 및 크기 (벨트 포인트에 상대적으로 계산)
const TRUCK = (() => {
  // 벨트 시작점 (첫 번째 포인트) 기준으로 트럭 위치 계산
  const beltStartX = BELT_POINTS[0].x;
  const beltStartY = BELT_POINTS[0].y;

  // 트럭을 벨트 시작점 왼쪽에 배치
  const truckOffsetX = -80; // 벨트 시작점에서 왼쪽으로 80픽셀
  const truckOffsetY = -30; // 벨트 시작점에서 위로 30픽셀

  return {
    x: beltStartX + truckOffsetX,
    y: beltStartY + truckOffsetY,
    width: TRUCK_BASE.width * SCALE_X,
    height: TRUCK_BASE.height * SCALE_Y,
  };
})();

// 하차 지점 (컨베이어 시작점)
const UNLOAD_POINT = {
  x: TRUCK.x + TRUCK.width,
  y: TRUCK.y + TRUCK.height / 2,
};

// 하차 작업자 위치 (하차지점 위/아래)
const UNLOAD_WORKERS = [
  {
    x: UNLOAD_POINT.x + UNLOAD_WORKER_OFFSET.x,
    y: UNLOAD_POINT.y - UNLOAD_WORKER_OFFSET.y,
  },
  {
    x: UNLOAD_POINT.x + UNLOAD_WORKER_OFFSET.x,
    y: UNLOAD_POINT.y + UNLOAD_WORKER_OFFSET.y,
  },
];

// 작업자 위치 계산 함수
function getWorkerPositionsOnBelt(workerCount: number) {
  const topCount = Math.max(0, workerCount - 10);
  const midCount = Math.min(10, workerCount);
  const selected: { x: number; y: number }[] = [];

  // 중간 10명(B) 먼저 균등 분포
  for (let i = 0; i < midCount; i++) {
    const t = i / (midCount - 1 || 1);
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
    const t = i / (topCount - 1 || 1);
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
const RECEIVE_WORKERS = getWorkerPositionsOnBelt(MAX_WORKERS);

// 하차 원(물건) 이동 애니메이션 (세그먼트별 거리에 따라 속도 조정)
const TOTAL_DISTANCE = (() => {
  let distance = 0;
  for (let i = 0; i < BELT_POINTS.length - 1; i++) {
    const p1 = BELT_POINTS[i];
    const p2 = BELT_POINTS[i + 1];
    distance += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
  return distance;
})();

// 작업자별 쿨다운 배율 (0.6~1.4, 마운트 시 고정)
const WORKER_COOLDOWN_SCALES = Array(MAX_WORKERS)
  .fill(0)
  .map(() => Math.random() * 0.8 + 0.6);

export default function Warehouse2D() {
  // 공장 가동 상태
  const [running, setRunning] = useState(false);
  // 컨트롤 상태
  const [unloadInterval, setUnloadInterval] = useState(1000); // 물건 하차 속도(ms)
  const [workerCooldown, setWorkerCooldown] = useState(5000); // 작업자 작업 속도(ms)
  const [workerCount, setWorkerCount] = useState(5); // 활성 작업자 수
  // 레일 속도 (컨트롤)
  const [beltSpeed, setBeltSpeed] = useState(1); // 1~5

  const speed = beltSpeed / 2 / (TOTAL_DISTANCE * 0.1); // 거리 기반 속도 계산
  const requestRef = useRef<number | null>(null);

  // 운송장 번호 상태 (UI 표시용 - 현재는 사용하지 않음)
  // const [itemSeq, setItemSeq] = useState(1200000001);

  // 여러 개의 하차 동그라미(물건) 상태
  const [circles, setCircles] = useState<{ progress: number; id: number }[]>(
    []
  );

  // 벨트 작업자별로 잡은 시간 배열
  const [workerCatchTimes, setWorkerCatchTimes] = useState<number[][]>(() =>
    Array(MAX_WORKERS)
      .fill(0)
      .map(() => [])
  );

  // 작업자별 일시적 고장 해제 시각 (0이면 정상)
  const [workerBrokenUntil, setWorkerBrokenUntil] = useState<number[]>(() =>
    Array(MAX_WORKERS).fill(0)
  );

  // 작업 실패(벨트 끝까지 도달한 동그라미) 카운트
  const [failCount, setFailCount] = useState(0);

  const ws = useWebSocket();

  // 운송장 번호 ref (타이머에서 사용)
  const itemSeqRef = useRef(1200000001);
  // WebSocket ref (타이머에서 사용)
  const wsRef = useRef(ws);
  wsRef.current = ws;

  // running이 false로 바뀔 때 상태 초기화
  useEffect(() => {
    if (!running) {
      setCircles([]);
      setWorkerCatchTimes(
        Array(MAX_WORKERS)
          .fill(0)
          .map(() => [])
      );
      setFailCount(0);
      itemSeqRef.current = 1200000001;
    }
  }, [running]);

  // 2초마다 새로운 동그라미 추가 → unloadInterval로 변경 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      // 하차 작업자 랜덤 선택 (U1 또는 U2)
      const unloadWorkerId = Math.random() < 0.5 ? "U1" : "U2";
      const currentItemSeq = itemSeqRef.current;

      setCircles((prev) => [...prev, { progress: 0, id: currentItemSeq }]);
      itemSeqRef.current += 1; // 실제 번호용

      // --- 하차 작업자 하차 완료 메시지 송출 ---
      wsRef.current?.send({
        ts: Date.now(),
        msg: "하차된 물건",
        unloadWorkerId: unloadWorkerId,
        itemId: currentItemSeq,
      });
    }, unloadInterval);
    return () => clearInterval(timer);
  }, [unloadInterval, running]); // running 추가

  // 각 동그라미의 progress를 부드럽게 업데이트 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    const animate = () => {
      setCircles((prev) =>
        prev.map((c) => {
          let next = c.progress + speed;
          if (next >= 1) next = 0;
          return { progress: next, id: c.id };
        })
      );
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [speed, running]); // running 추가

  // 동그라미가 작업자 위치에 오면 즉시 사라지게 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    const now = Date.now();
    const removeIdxs: number[] = [];
    const newCatchTimes = workerCatchTimes.map((times) => [...times]);
    const caughtCircleSet = new Set<number>();
    const newBrokenUntil = [...workerBrokenUntil];
    for (let workerIdx = 0; workerIdx < workerCount; workerIdx++) {
      const w = RECEIVE_WORKERS[workerIdx];
      const last =
        workerCatchTimes[workerIdx].length > 0
          ? workerCatchTimes[workerIdx][workerCatchTimes[workerIdx].length - 1]
          : 0;
      // --- 쿨다운 배율 적용 ---
      const workerCooldownWithScale =
        workerCooldown * WORKER_COOLDOWN_SCALES[workerIdx];
      // --- 고장 상태면 skip ---
      if (workerBrokenUntil[workerIdx] > now) continue;
      if (now - last < workerCooldownWithScale) continue;
      let caught = false;
      circles.forEach((circle, cIdx) => {
        if (caughtCircleSet.has(cIdx) || caught) return;

        // 거리 기반 위치 계산
        const targetDistance = circle.progress * TOTAL_DISTANCE;
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
        const movingCircle = {
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
        };

        const dx = w.x - movingCircle.x;
        const dy = w.y - movingCircle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < WORKER_CATCH_RANGE) {
          // --- 고장 조건 체크 ---
          // 5% 확율로 고장: 끝 두자리의 차이가 2 이하일 때
          const cooldownLast2 = Math.round(workerCooldownWithScale) % 100;
          const itemIdLast2 = circle.id % 100;
          if (Math.abs(cooldownLast2 - itemIdLast2) <= 2) {
            // 고장 발생!
            newBrokenUntil[workerIdx] = now + 15000;
            // 고장 발생 메시지 송출
            ws?.send({
              ts: now,
              msg: "작업자 고장",
              workerId:
                workerIdx < 10 ? `A${workerIdx + 1}` : `B${workerIdx - 9}`,
              itemId: circle.id,
              cooldown: Math.round(workerCooldownWithScale),
              brokenUntil: newBrokenUntil[workerIdx],
            });
          } else {
            removeIdxs.push(cIdx);
            caughtCircleSet.add(cIdx);
            newCatchTimes[workerIdx].push(now);
            caught = true;
            // --- 여기서 WebSocket으로 송출 ---
            ws?.send({
              ts: now,
              msg: "작업자 처리",
              workerId:
                workerIdx < 10 ? `A${workerIdx + 1}` : `B${workerIdx - 9}`,
              itemId: circle.id,
              count: newCatchTimes[workerIdx].length + 1,
            });
          }
        }
      });
    }
    if (
      removeIdxs.length > 0 ||
      newBrokenUntil.some((v, i) => v !== workerBrokenUntil[i])
    ) {
      if (removeIdxs.length > 0) {
        const removeSet = new Set(removeIdxs);
        setCircles((prev) => prev.filter((_, i) => !removeSet.has(i)));
        setWorkerCatchTimes(newCatchTimes);
      }
      if (newBrokenUntil.some((v, i) => v !== workerBrokenUntil[i])) {
        setWorkerBrokenUntil(newBrokenUntil);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    circles,
    workerCatchTimes,
    workerCooldown,
    workerCount,
    running, // running 추가
    workerBrokenUntil,
  ]);

  // 벨트 끝까지 도달한 동그라미를 실패로 처리 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    // 마지막 포인트에 도달한 동그라미 인덱스
    const failedIdxs = circles
      .map((circle, i) => {
        // 거리 기반으로 끝에 도달했는지 확인
        const targetDistance = circle.progress * TOTAL_DISTANCE;
        return targetDistance >= TOTAL_DISTANCE - 10 ? i : -1; // 10픽셀 여유
      })
      .filter((i) => i !== -1);
    if (failedIdxs.length > 0) {
      setFailCount((failCount) => failCount + failedIdxs.length);
      setCircles((prev) => prev.filter((_, i) => !failedIdxs.includes(i)));
    }
  }, [circles, running]); // TOTAL_DISTANCE는 상수이므로 의존성에서 제거

  // 하차 작업자 스타일
  // 레일 작업자 스타일

  return (
    <div style={{ width: WIDTH, margin: "0 auto" }}>
      {/* 컨트롤 UI */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <label>
          물건 하차 속도(ms):
          <input
            type="range"
            min={500}
            max={5000}
            step={100}
            value={unloadInterval}
            onChange={(e) => setUnloadInterval(Number(e.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{unloadInterval}</span>
        </label>
        <label>
          작업자 평균 작업 속도(ms):
          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={workerCooldown}
            onChange={(e) => setWorkerCooldown(Number(e.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{workerCooldown}</span>
        </label>
        <label>
          작업자 수:
          <input
            type="number"
            min={1}
            max={20}
            value={workerCount}
            onChange={(e) => setWorkerCount(Number(e.target.value))}
            style={{ width: 48, marginLeft: 8 }}
          />
        </label>
        <label>
          레일 속도:
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={beltSpeed}
            onChange={(e) => setBeltSpeed(Number(e.target.value))}
            style={{ width: 120, marginLeft: 8 }}
          />
          <span style={{ marginLeft: 8 }}>{beltSpeed}x</span>
        </label>
        <label style={{ display: "flex", alignItems: "center" }}>
          작업 실패:
          <span
            style={{
              display: "inline-block",
              background: "#c62828",
              color: "#fff",
              borderRadius: 12,
              padding: "2px 16px",
              fontWeight: 700,
              fontSize: 16,
              marginLeft: 8,
              minWidth: 36,
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            {failCount}
          </span>
        </label>
      </div>

      {/* svg와 버튼을 감싸는 div */}
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          margin: "0 auto",
        }}
      >
        {/* 공장 가동 중단 버튼 (왼쪽 상단) */}
        {running && (
          <button
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              zIndex: 10,
              fontSize: 16,
              padding: "8px 20px",
              background: "#c62828",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              boxShadow: "0 2px 8px #0002",
              cursor: "pointer",
            }}
            onClick={() => setRunning(false)}
          >
            중단하기
          </button>
        )}
        {/* 공장 가동 시작 버튼 (중앙) */}
        {!running && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              background: "#fff9",
              borderRadius: 16,
            }}
          >
            <button
              style={{
                fontSize: 36,
                padding: "32px 64px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                fontWeight: "bold",
                boxShadow: "0 4px 16px #0002",
                cursor: "pointer",
              }}
              onClick={() => setRunning(true)}
            >
              공장 가동 시작
            </button>
          </div>
        )}
        {/* SVG 시각화 */}
        <svg
          width={WIDTH}
          height={HEIGHT}
          style={{
            background: "#f5f5f5",
            borderRadius: 16,
            boxShadow: "0 2px 8px #0001",
          }}
        >
          {/* 컨베이어 벨트 배경 (넓고 반투명한 회색) */}
          <path
            d={BELT_PATH}
            stroke="#999"
            strokeWidth={35}
            fill="none"
            opacity={0.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 컨베이어 벨트 어두운 회색 가로줄들 */}
          {(() => {
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
              const isometricPerp = toIsometric(
                normalizedPerpX,
                normalizedPerpY
              );

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
            return lines;
          })()}

          {/* 하차 트럭 (네모) */}
          <rect
            x={TRUCK.x}
            y={TRUCK.y}
            width={TRUCK.width}
            height={TRUCK.height}
            fill="#90caf9"
            stroke="#1976d2"
            strokeWidth={4}
            rx={10}
          />
          <text
            x={TRUCK.x + TRUCK.width / 2}
            y={TRUCK.y + TRUCK.height / 2 + 6}
            textAnchor="middle"
            fontSize={16}
            fill="#1976d2"
            fontWeight="bold"
          >
            트럭
          </text>

          {/* 하차 작업자 (트럭 위/아래) */}
          {UNLOAD_WORKERS.map((w, i) => (
            <g key={i}>
              <circle cx={w.x} cy={w.y} r={16} {...UNLOAD_WORKER_STYLE} />
              {/* 하차 작업자 번호 */}
              <text
                x={w.x}
                y={w.y + 6}
                textAnchor="middle"
                fontSize={14}
                fontWeight="bold"
                fill="#fff"
              >
                U{i + 1}
              </text>
            </g>
          ))}

          {/* 하차 지점 */}
          <circle
            cx={UNLOAD_POINT.x}
            cy={UNLOAD_POINT.y}
            r={18}
            fill={boxColor}
            stroke="#b26a00"
            strokeWidth={3}
          />
          <text
            x={UNLOAD_POINT.x}
            y={UNLOAD_POINT.y + 5}
            textAnchor="middle"
            fontSize={14}
            fill="#333"
          >
            하차
          </text>

          {/* 이동하는 하차 원(물건, 여러 개) */}
          {circles.map((circle, i) => {
            // 거리 기반 위치 계산
            const targetDistance = circle.progress * TOTAL_DISTANCE;
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
            const movingCircle = {
              x: p1.x + (p2.x - p1.x) * t,
              y: p1.y + (p2.y - p1.y) * t,
            };

            return (
              <g key={i}>
                <circle
                  cx={movingCircle.x}
                  cy={movingCircle.y}
                  r={14}
                  fill="#ff5252"
                  stroke="#b71c1c"
                  strokeWidth={3}
                />
                <text
                  x={movingCircle.x}
                  y={movingCircle.y + 5}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#fff"
                >
                  하차
                </text>
              </g>
            );
          })}

          {/* 벨트 작업자 */}
          {Array.from({ length: workerCount }).map((_, i) => {
            // 작업자 1~10: A1~A10, 11~20: B1~B10
            const isTop = i < 10;
            const label = isTop ? `A${i + 1}` : `B${i - 9}`;
            const countY = isTop
              ? RECEIVE_WORKERS[i].y + 34
              : RECEIVE_WORKERS[i].y - 28;

            // 쿨다운 상태 확인
            const now = Date.now();
            const lastCatchTime =
              workerCatchTimes[i].length > 0
                ? workerCatchTimes[i][workerCatchTimes[i].length - 1]
                : 0;
            // --- 쿨다운 배율 적용 ---
            const workerCooldownWithScale =
              workerCooldown * WORKER_COOLDOWN_SCALES[i];
            const cooldownLeft = Math.max(
              0,
              workerCooldownWithScale - (now - lastCatchTime)
            );
            const cooldownRatio = Math.min(
              1,
              cooldownLeft / workerCooldownWithScale
            ); // 0~1
            const r = 15;
            const cx = RECEIVE_WORKERS[i].x;
            const cy = RECEIVE_WORKERS[i].y;
            // (yellowHeight, yellowY는 barHeight, barY로 대체됨)
            // --- 고장 상태 확인 ---
            const isBroken = workerBrokenUntil[i] > now;
            let barRatio = cooldownRatio;
            let barColor = "#fff59d";
            if (isBroken) {
              const brokenLeft = workerBrokenUntil[i] - now;
              barRatio = Math.min(1, Math.max(0, brokenLeft / 15000));
              barColor = "#ef5350";
            }
            const barHeight = 2 * r * barRatio;
            const barY = cy + r - barHeight;

            return (
              <g key={i}>
                {/* 기본 초록색 원 */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={BELT_WORKER_STYLE.fill}
                  stroke={BELT_WORKER_STYLE.stroke}
                  strokeWidth={BELT_WORKER_STYLE.strokeWidth}
                />
                {/* 쿨다운 남은 시간만큼 노란색/빨간색 덮기 (아래에서 위로) */}
                {barRatio > 0 && (
                  <g>
                    <clipPath id={`cooldown-mask-${i}`}>
                      <rect
                        x={cx - r}
                        y={barY}
                        width={2 * r}
                        height={barHeight}
                      />
                    </clipPath>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={barColor}
                      stroke={BELT_WORKER_STYLE.stroke}
                      strokeWidth={BELT_WORKER_STYLE.strokeWidth}
                      clipPath={`url(#cooldown-mask-${i})`}
                    />
                  </g>
                )}
                {/* 작업자 번호 */}
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  fill="#222"
                >
                  {label}
                </text>
                {/* 작업자별 카운트 */}
                <text
                  x={cx}
                  y={countY}
                  textAnchor="middle"
                  fontSize={16}
                  fontWeight="bold"
                  fill="#333"
                >
                  {workerCatchTimes[i].length}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* 전체 작업자들의 작업 속도 배열 표시 */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          height: 100,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: "bold", color: "#1976d2" }}>
          작업자별 작업 속도(ms):
        </span>
        {WORKER_COOLDOWN_SCALES.slice(0, workerCount).map((scale, i) => {
          const actualCooldown = Math.round(workerCooldown * scale);
          const isTop = i < 10;
          const label = isTop ? `A${i + 1}` : `B${i - 9}`;
          return (
            <span
              key={i}
              style={{
                background: "#e3f2fd",
                color: "#1976d2",
                padding: "4px 8px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: "bold",
                border: "1px solid #bbdefb",
                height: 24,
                lineHeight: "16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "fit-content",
              }}
            >
              {label}: {actualCooldown}
            </span>
          );
        })}
      </div>
    </div>
  );
}
