import React, { useEffect, useRef, useState } from "react";

// 창고 2D 시각화: ㄷ자 컨베이어, 하차지점, 작업자들
const beltColor = "#888";
const workerUnloadColor = "#1976d2";
const workerReceiveColor = "#43a047";
const boxColor = "#ffb300";

export default function Warehouse2D() {
  // 컨트롤 상태
  const [unloadInterval, setUnloadInterval] = useState(2000); // 물건 하차 속도(ms)
  const [workerCooldown, setWorkerCooldown] = useState(5000); // 작업자 작업 속도(ms)
  const [workerCount, setWorkerCount] = useState(5); // 작업자 수

  // SVG 크기
  const width = 600;
  const height = 400;

  // 컨베이어 벨트 경로 (ㄷ자)
  const beltPath = `M 100 350 L 500 350 L 500 100 L 100 100`;

  // 컨베이어 벨트 경로를 따라 이동할 포인트들 (더 촘촘하게)
  const beltPoints = [
    // 아래쪽 (좌→우)
    { x: 100, y: 350 },
    { x: 150, y: 350 },
    { x: 200, y: 350 },
    { x: 250, y: 350 },
    { x: 300, y: 350 },
    { x: 350, y: 350 },
    { x: 400, y: 350 },
    { x: 450, y: 350 },
    { x: 500, y: 350 },
    // 오른쪽 (아래→위)
    { x: 500, y: 300 },
    { x: 500, y: 250 },
    { x: 500, y: 200 },
    { x: 500, y: 150 },
    { x: 500, y: 100 },
    // 위쪽 (우→좌)
    { x: 450, y: 100 },
    { x: 400, y: 100 },
    { x: 350, y: 100 },
    { x: 300, y: 100 },
    { x: 250, y: 100 },
    { x: 200, y: 100 },
    { x: 150, y: 100 },
    { x: 100, y: 100 },
    // 왼쪽 (위→아래)
    { x: 100, y: 150 },
    { x: 100, y: 200 },
    { x: 100, y: 250 },
    { x: 100, y: 300 },
    { x: 100, y: 350 }, // 루프
  ];

  // 하차 트럭 위치 및 크기
  const truck = { x: 60, y: 320, width: 60, height: 60 };

  // 하차 지점 (컨베이어 시작점)
  const unloadPoint = {
    x: truck.x + truck.width,
    y: truck.y + truck.height / 2,
  };

  // 하차 작업자 위치 (하차지점 위/아래)
  const unloadWorkers = [
    { x: unloadPoint.x, y: unloadPoint.y - 32 }, // 하차지점 위
    { x: unloadPoint.x, y: unloadPoint.y + 32 }, // 하차지점 아래
  ];

  // 벨트 작업자 위치 (윗쪽) - workerCount에 따라 동적으로 생성
  const receiveWorkers = Array.from({ length: workerCount }, (_, i) => ({
    x: 120 + ((480 - 120) / (workerCount - 1 || 1)) * i,
    y: 80,
  }));

  // 하차 원(물건) 이동 애니메이션 (더 느리게)
  const speed = 1 / (beltPoints.length * 60);
  const requestRef = useRef<number | null>(null);

  // 여러 개의 하차 동그라미(물건) 상태
  const [circles, setCircles] = useState<{ progress: number }[]>([
    { progress: 0 },
  ]);

  // 벨트 작업자별로 잡은 시간 배열
  const [workerCatchTimes, setWorkerCatchTimes] = useState<number[][]>(() =>
    Array(workerCount)
      .fill(0)
      .map(() => [])
  );
  // workerCount가 바뀌면 배열 리셋
  useEffect(() => {
    setWorkerCatchTimes(
      Array(workerCount)
        .fill(0)
        .map(() => [])
    );
  }, [workerCount]);

  // 2초마다 새로운 동그라미 추가 → unloadInterval로 변경
  useEffect(() => {
    const timer = setInterval(() => {
      setCircles((prev) => [...prev, { progress: 0 }]);
    }, unloadInterval);
    return () => clearInterval(timer);
  }, [unloadInterval]);

  // 각 동그라미의 progress를 부드럽게 업데이트
  useEffect(() => {
    const animate = () => {
      setCircles((prev) =>
        prev.map((c) => {
          let next = c.progress + speed;
          if (next >= 1) next = 0;
          return { progress: next };
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
  }, [speed]);

  // 동그라미가 작업자 위치에 오면 즉시 사라지게 (시간 제한 없이)
  useEffect(() => {
    const now = Date.now();
    const removeIdxs: number[] = [];
    const newCatchTimes = workerCatchTimes.map((times) => [...times]);
    const caughtCircleSet = new Set<number>();
    receiveWorkers.forEach((w, workerIdx) => {
      const last =
        workerCatchTimes[workerIdx].length > 0
          ? workerCatchTimes[workerIdx][workerCatchTimes[workerIdx].length - 1]
          : 0;
      if (now - last < workerCooldown) return;
      let caught = false;
      circles.forEach((circle, cIdx) => {
        if (caughtCircleSet.has(cIdx) || caught) return;
        const totalSegments = beltPoints.length - 1;
        const seg = circle.progress * totalSegments;
        const segIdx = Math.floor(seg);
        const t = seg - segIdx;
        const p1 = beltPoints[segIdx];
        const p2 = beltPoints[(segIdx + 1) % beltPoints.length];
        const movingCircle = {
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
        };
        const dx = w.x - movingCircle.x;
        const dy = w.y - movingCircle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
          removeIdxs.push(cIdx);
          caughtCircleSet.add(cIdx);
          newCatchTimes[workerIdx].push(now);
          caught = true;
        }
      });
    });
    if (removeIdxs.length > 0) {
      const removeSet = new Set(removeIdxs);
      setCircles((prev) => prev.filter((_, i) => !removeSet.has(i)));
      setWorkerCatchTimes(newCatchTimes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circles, receiveWorkers, beltPoints, workerCatchTimes, workerCooldown]);

  return (
    <div style={{ width: width, margin: "0 auto" }}>
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
          작업자 작업 속도(ms):
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
            max={10}
            value={workerCount}
            onChange={(e) => setWorkerCount(Number(e.target.value))}
            style={{ width: 48, marginLeft: 8 }}
          />
        </label>
      </div>
      {/* SVG 시각화 */}
      <svg
        width={width}
        height={height}
        style={{
          background: "#f5f5f5",
          borderRadius: 16,
          boxShadow: "0 2px 8px #0001",
        }}
      >
        {/* 컨베이어 벨트 (점선) */}
        <path
          d={beltPath}
          stroke={beltColor}
          strokeWidth={10}
          fill="none"
          strokeDasharray="16 12"
        />

        {/* 하차 트럭 (네모) */}
        <rect
          x={truck.x}
          y={truck.y}
          width={truck.width}
          height={truck.height}
          fill="#90caf9"
          stroke="#1976d2"
          strokeWidth={4}
          rx={10}
        />
        <text
          x={truck.x + truck.width / 2}
          y={truck.y + truck.height / 2 + 6}
          textAnchor="middle"
          fontSize={16}
          fill="#1976d2"
          fontWeight="bold"
        >
          트럭
        </text>

        {/* 하차 작업자 (트럭 위/아래) */}
        {unloadWorkers.map((w, i) => (
          <g key={i}>
            <circle cx={w.x} cy={w.y} r={14} fill={workerUnloadColor} />
            <text
              x={w.x}
              y={w.y + 5}
              textAnchor="middle"
              fontSize={12}
              fill="#fff"
            >
              작업자
            </text>
          </g>
        ))}

        {/* 하차 지점 */}
        <circle
          cx={unloadPoint.x}
          cy={unloadPoint.y}
          r={18}
          fill={boxColor}
          stroke="#b26a00"
          strokeWidth={3}
        />
        <text
          x={unloadPoint.x}
          y={unloadPoint.y + 5}
          textAnchor="middle"
          fontSize={14}
          fill="#333"
        >
          하차
        </text>

        {/* 이동하는 하차 원(물건, 여러 개) */}
        {circles.map((circle, i) => {
          const totalSegments = beltPoints.length - 1;
          const seg = circle.progress * totalSegments;
          const segIdx = Math.floor(seg);
          const t = seg - segIdx;
          const p1 = beltPoints[segIdx];
          const p2 = beltPoints[(segIdx + 1) % beltPoints.length];
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
        {receiveWorkers.map((w, i) => (
          <g key={i}>
            <circle
              cx={w.x}
              cy={w.y}
              r={14}
              fill={workerReceiveColor}
              stroke="#333"
              strokeWidth={1}
            />
            <text
              x={w.x}
              y={w.y + 5}
              textAnchor="middle"
              fontSize={12}
              fill="#fff"
            >
              작업자
            </text>
            {/* 작업자별 카운트 */}
            <text
              x={w.x}
              y={w.y + 30}
              textAnchor="middle"
              fontSize={16}
              fill="#333"
            >
              {workerCatchTimes[i].length}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
